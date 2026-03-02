import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ref, onValue } from 'firebase/database'
import { db } from '../Auth/Firebase'
import { X, Heart } from 'lucide-react'
import { addComment } from '../store/slices/postsSlice'
import { closeCommentsModal } from '../store/slices/uiSlice'

const timeAgo = (ts) => {
  if (!ts) return ''
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return `${Math.floor(diff / 604800)}w`
}

export const CommentsModal = () => {
  const dispatch = useDispatch()
  const { open, postId } = useSelector((s) => s.ui.commentsModal)
  const { uid, displayName, photoURL } = useSelector((s) => s.auth)
  const posts = useSelector((s) => s.posts.all)

  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const inputRef = useRef(null)
  const commentsEndRef = useRef(null)

  const safePhoto = photoURL || 'https://i.pravatar.cc/80?img=50'
  const post = posts.find((p) => p.id === postId)

  // Listen to comments in real time
  useEffect(() => {
    if (!open || !postId) return
    const unsub = onValue(ref(db, `postComments/${postId}`), (snap) => {
      const val = snap.val() || {}
      setComments(Object.values(val).sort((a, b) => a.createdAt - b.createdAt))
    })
    return unsub
  }, [open, postId])

  // Auto-scroll to bottom when new comment added
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  // Focus the input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const handlePost = async () => {
    if (!uid || !text.trim()) return
    await dispatch(addComment({
      postId,
      uid,
      displayName: displayName || 'User',
      photoURL: safePhoto,
      text: text.trim(),
    }))
    setText('')
  }

  const handleClose = () => {
    dispatch(closeCommentsModal())
    setText('')
  }

  if (!open || !postId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60" onClick={handleClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl overflow-hidden max-h-[90dvh] sm:max-h-[85vh] sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <div />
          <h3 className="text-sm font-bold">Comments</h3>
          <button onClick={handleClose}>
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Caption as first "comment" */}
        {post?.caption && (
          <div className="border-b border-zinc-100 px-4 py-3">
            <div className="flex gap-3">
              <img
                src={post.photoURL || 'https://i.pravatar.cc/32'}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] leading-snug">
                  <span className="font-semibold">{post.displayName || 'user'}</span>{' '}
                  <span className="text-slate-700">{post.caption}</span>
                </p>
                <p className="mt-1 text-[11px] text-slate-400">{timeAgo(post.createdAt)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-2" style={{ minHeight: 150 }}>
          {comments.length === 0 && (
            <div className="flex h-full items-center justify-center py-12">
              <div className="text-center">
                <p className="text-lg font-bold text-slate-800">No comments yet.</p>
                <p className="mt-1 text-sm text-slate-400">Start the conversation.</p>
              </div>
            </div>
          )}

          {comments.map((c, i) => (
            <div key={i} className="flex gap-3 py-3">
              <img
                src={c.photoURL || 'https://i.pravatar.cc/32'}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] leading-snug">
                  <span className="font-semibold text-slate-900">{c.displayName}</span>{' '}
                  <span className="text-slate-700">{c.text}</span>
                </p>
                <div className="mt-1 flex items-center gap-4 text-[11px] text-slate-400">
                  <span>{timeAgo(c.createdAt)}</span>
                  <button className="font-semibold hover:text-slate-600">Reply</button>
                </div>
              </div>
              <button className="shrink-0 self-center p-1 text-slate-300 hover:text-red-400 transition">
                <Heart className="h-3 w-3" />
              </button>
            </div>
          ))}
          <div ref={commentsEndRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-zinc-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={safePhoto} alt="me" className="h-8 w-8 shrink-0 rounded-full object-cover" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Add a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePost()}
              className="flex-1 text-sm outline-none placeholder:text-slate-400"
            />
            <button
              onClick={handlePost}
              disabled={!text.trim()}
              className="text-sm font-semibold text-sky-500 transition hover:text-sky-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
