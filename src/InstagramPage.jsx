import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ref, onValue, update } from 'firebase/database'
import { db } from './Auth/Firebase'

/* ── Redux imports ─────────────────────────────────────── */
import { setUsers } from './store/slices/usersSlice'
import { setPosts, setLikedPosts } from './store/slices/postsSlice'
import { setFriends, setIncomingRequests, setSentRequests } from './store/slices/friendSlice'

/* ── Component imports ─────────────────────────────────── */
import { Sidebar } from './components/Sidebar'
import { FeedHeader } from './components/FeedHeader'
import { MobileBottomNav } from './components/MobileBottomNav'
import { FriendRequestsPanel } from './components/FriendRequestsPanel'
import { Stories } from './components/Stories'
import { PostCard } from './components/PostCard'
import { RightSidebar } from './components/RightSidebar'
import { CreatePostModal } from './components/CreatePostModal'
import { StoryUploadModal } from './components/StoryUploadModal'
import { StoryViewer } from './components/StoryViewer'
import { CommentsModal } from './components/CommentsModal'
import { ConfirmModal } from './components/ConfirmModal'

export const InstagramPage = () => {
  const dispatch = useDispatch()
  const [showMobileRequests, setShowMobileRequests] = useState(false)

  /* ── Redux state ─────────────────────────────────────── */
  const { uid, email, displayName, photoURL } = useSelector((s) => s.auth)
  const users = useSelector((s) => s.users.all)
  const posts = useSelector((s) => s.posts.all)
  const friends = useSelector((s) => s.friend.friends)
  const incomingRequests = useSelector((s) => s.friend.incomingRequests)
  const sentRequests = useSelector((s) => s.friend.sentRequests)

  /* ── Stories state (lives here since stories are real-time from DB) ── */
  const [friendStories, setFriendStories] = useState([])
  const [ownStories, setOwnStories] = useState([])

  /* ── setup: save user profile ──────────────────────── */
  useEffect(() => {
    if (!uid) return
    update(ref(db, `users/${uid}`), {
      uid,
      email,
      displayName,
      photoURL: photoURL || 'https://i.pravatar.cc/80?img=50',
    })
  }, [uid, email, displayName, photoURL])

  /* ── setup: real-time Firebase listeners → Redux ──── */
  useEffect(() => {
    const unsubs = []

    unsubs.push(onValue(ref(db, 'users'), (s) => dispatch(setUsers(s.val() || {}))))

    unsubs.push(
      onValue(ref(db, 'posts'), (s) => {
        const val = s.val() || {}
        dispatch(setPosts(Object.values(val).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))))
      })
    )

    if (uid) {
      unsubs.push(onValue(ref(db, `friends/${uid}`), (s) => dispatch(setFriends(s.val() || {}))))
      unsubs.push(onValue(ref(db, `friendRequests/${uid}`), (s) => dispatch(setIncomingRequests(s.val() || {}))))
      unsubs.push(onValue(ref(db, `sentRequests/${uid}`), (s) => dispatch(setSentRequests(s.val() || {}))))
      unsubs.push(onValue(ref(db, `postLikesByUser/${uid}`), (s) => dispatch(setLikedPosts(s.val() || {}))))
    }

    return () => unsubs.forEach((u) => u())
  }, [uid, dispatch])

  /* ── Listen to own stories ── */
  useEffect(() => {
    if (!uid) return
    const unsub = onValue(ref(db, `stories/${uid}`), (snap) => {
      const val = snap.val() || {}
      const now = Date.now()
      const active = Object.values(val)
        .filter((s) => s.expiresAt > now)
        .sort((a, b) => a.createdAt - b.createdAt)
      setOwnStories(active)
    })
    return unsub
  }, [uid])

  /* ── Listen to friend stories ── */
  useEffect(() => {
    if (!uid) return
    const friendIds = Object.keys(friends)
    if (friendIds.length === 0) { setFriendStories([]); return }

    const unsubs = []
    const allStories = {}

    friendIds.forEach((fid) => {
      const unsub = onValue(ref(db, `stories/${fid}`), (snap) => {
        const val = snap.val() || {}
        const now = Date.now()
        const active = Object.values(val)
          .filter((s) => s.expiresAt > now)
          .sort((a, b) => b.createdAt - a.createdAt)
        if (active.length > 0) {
          allStories[fid] = active[0] // latest active story per friend
        } else {
          delete allStories[fid]
        }
        setFriendStories(Object.values(allStories))
      })
      unsubs.push(unsub)
    })

    return () => unsubs.forEach((u) => u())
  }, [uid, friends])

  /* ── derived data ────────────────────────────────────── */
  const suggestions = useMemo(() => {
    return Object.values(users).filter((u) => u.uid !== uid && !friends[u.uid] && !incomingRequests[u.uid])
  }, [users, uid, friends, incomingRequests])

  const requestsList = useMemo(() => {
    return Object.values(incomingRequests).filter((r) => r.status === 'pending')
  }, [incomingRequests])

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="flex min-h-screen flex-col bg-white text-sm text-slate-900 lg:flex-row">

      {/* ── Modals ── */}
      <ConfirmModal />
      <CreatePostModal />
      <StoryUploadModal />
      <StoryViewer />
      <CommentsModal />

      {/* ── MOBILE TOP HEADER ────────────── */}
      <FeedHeader onShowMobileRequests={setShowMobileRequests} incomingRequestsCount={requestsList.length} />

      {/* ── MOBILE FRIEND REQUESTS PANEL ─── */}
      <FriendRequestsPanel show={showMobileRequests} requests={requestsList} />

      {/* ── DESKTOP LEFT SIDEBAR ─────────── */}
      <Sidebar incomingRequestsCount={requestsList.length} />

      {/* ── MAIN CONTENT ─────────────────── */}
      <div className="flex flex-1 justify-center pb-16 lg:ml-18 lg:pb-0">
        <div className="flex w-full max-w-205 gap-8 px-0 py-2 sm:px-4 sm:py-6 lg:px-0">

          {/* ── CENTER FEED ──────────────── */}
          <section className="mx-auto w-full max-w-117.5">

            {/* stories bar */}
            <Stories stories={friendStories} ownStories={ownStories} />

            {/* posts feed */}
            {posts.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <p className="text-base font-medium">No posts yet</p>
                <p className="mt-1 text-xs">Create a post or add friends to see their posts here.</p>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>

          {/* ── RIGHT SIDEBAR (desktop) ──── */}
          <RightSidebar
            users={users}
            friends={friends}
            incomingRequests={incomingRequests}
            sentRequests={sentRequests}
            uid={uid}
            email={email}
            displayName={displayName}
            photoURL={photoURL}
            suggestions={suggestions}
          />
        </div>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ────────── */}
      <MobileBottomNav />
    </div>
  )
}
