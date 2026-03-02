import React, { useEffect, useMemo, useState, useRef } from 'react'
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
  const [visibleCount, setVisibleCount] = useState(8)
  const sentinelRef = useRef(null)
  const feedRef = useRef(null)

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

  /* ── infinite scroll over posts ─────────────────────── */
  useEffect(() => {
    setVisibleCount((prev) => Math.max(8, Math.min(posts.length, prev)))
  }, [posts.length])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          setVisibleCount((c) => Math.min(posts.length, c + 6))
        }
      },
      { root: feedRef.current, rootMargin: '300px', threshold: 0 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [posts.length])

  const visiblePosts = posts.slice(0, visibleCount)

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <div className="mobile-vh flex flex-col overflow-hidden bg-zinc-50 text-sm text-zinc-900 lg:flex-row">

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

      {/* ── DESKTOP LEFT SIDEBAR (fixed, never scrolls) ─── */}
      <Sidebar incomingRequestsCount={requestsList.length} />

      {/* ── MAIN CONTENT AREA ─────────────── */}
      <div className="flex min-h-0 flex-1 justify-center lg:ml-18">
        <div className="flex h-full w-full max-w-205 gap-8 px-0 lg:px-0">

          {/* ── CENTER FEED (only this scrolls) ── */}
          <section ref={feedRef} className="mx-auto w-full max-w-117.5 flex-1 overflow-y-auto overscroll-y-contain pb-20 pt-2 sm:pt-6 lg:pb-6 scrollbar-hide">

            {/* stories bar */}
            <Stories stories={friendStories} ownStories={ownStories} />

            {/* posts feed */}
            {posts.length === 0 && (
              <div className="py-16 text-center text-zinc-400">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-zinc-200">
                  <svg className="h-8 w-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-zinc-600">No posts yet</p>
                <p className="mt-1 text-xs text-zinc-400">Create a post or add friends to see their posts here.</p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:gap-5">
              {visiblePosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

              {posts.length > visiblePosts.length && (
                <div ref={sentinelRef} className="flex items-center justify-center py-6">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-500" />
                </div>
              )}

              {posts.length > 0 && posts.length === visiblePosts.length && (
                <div className="py-6 text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200">
                    <svg className="h-6 w-6 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-zinc-400">You're all caught up</p>
                </div>
              )}
            </div>
          </section>

          {/* ── RIGHT SIDEBAR (fixed position, no scroll) ── */}
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
