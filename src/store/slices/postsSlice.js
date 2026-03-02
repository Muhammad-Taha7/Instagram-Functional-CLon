import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ref, set, push, remove, runTransaction, update } from 'firebase/database'
import { db } from '../../Auth/Firebase'

/* ── Async Thunks ─────────────────────────────────────── */

export const createPost = createAsyncThunk(
  'posts/createPost',
  async ({ uid, displayName, photoURL, caption, files }) => {
    if (!uid) throw new Error('Not signed in')
    if (!files || files.length === 0) throw new Error('No files selected')

    const media = []
    try {
      // Convert files to base64 data URLs (stored directly in DB)
      for (const file of files) {
        const isVideo = file.type.startsWith('video')
        const url = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        media.push({ url, type: isVideo ? 'video' : 'image' })
      }

      // Write post + media directly to DB
      const newRef = push(ref(db, 'posts'))
      await set(newRef, {
        id: newRef.key,
        uid,
        displayName,
        photoURL,
        caption,
        media,
        createdAt: Date.now(),
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
      })
      console.log('Post created:', newRef.key)
    } catch (err) {
      console.error('createPost failed:', err)
      throw new Error(err?.message || 'Failed to create post')
    }
  }
)

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async ({ postId, ownerId }, { getState }) => {
    const { auth } = getState()
    if (auth.uid !== ownerId) throw new Error('Unauthorized: only the post owner can delete')
    await remove(ref(db, `posts/${postId}`))
    await remove(ref(db, `postLikes/${postId}`))
    await remove(ref(db, `postComments/${postId}`))
  }
)

export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async ({ postId }, { getState }) => {
    const { auth, posts } = getState()
    const uid = auth.uid
    if (!uid) return
    const liked = !!posts.likedPosts[postId]
    const updates = {}
    updates[`postLikesByUser/${uid}/${postId}`] = liked ? null : true
    updates[`postLikes/${postId}/${uid}`] = liked ? null : true
    await update(ref(db), updates)
    await runTransaction(ref(db, `posts/${postId}/likeCount`), (c) => {
      const cur = c || 0
      return liked ? Math.max(cur - 1, 0) : cur + 1
    })
  }
)

export const sharePost = createAsyncThunk(
  'posts/sharePost',
  async ({ postId }) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Check this post!', url: window.location.href })
      } catch { /* dismissed */ }
    }
    await runTransaction(ref(db, `posts/${postId}/shareCount`), (c) => (c || 0) + 1)
  }
)

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, uid, displayName, photoURL, text }) => {
    if (!uid || !text.trim()) return
    const newRef = push(ref(db, `postComments/${postId}`))
    await set(newRef, { uid, displayName, photoURL, text: text.trim(), createdAt: Date.now() })
    await runTransaction(ref(db, `posts/${postId}/commentCount`), (c) => (c || 0) + 1)
  }
)

/* ── Slice ─────────────────────────────────────────────── */

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    all: [],
    likedPosts: {},
    uploading: false,
  },
  reducers: {
    setPosts(state, action) {
      state.all = action.payload ?? []
    },
    setLikedPosts(state, action) {
      state.likedPosts = action.payload ?? {}
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPost.pending, (state) => { state.uploading = true })
      .addCase(createPost.fulfilled, (state) => { state.uploading = false })
      .addCase(createPost.rejected, (state) => { state.uploading = false })
  },
})

export const { setPosts, setLikedPosts } = postsSlice.actions
export default postsSlice.reducer
