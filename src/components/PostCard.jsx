import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ref, onValue } from 'firebase/database'
import { db } from '../Auth/Firebase'
import { Heart, MessageCircle, Send, Bookmark, Trash2, UserPlus, UserCheck, Clock, Users, MoreHorizontal } from 'lucide-react'
import { toggleLike, sharePost } from '../store/slices/postsSlice'
import { sendFriendRequest, cancelFriendRequest, acceptFriendRequest } from '../store/slices/friendSlice'
import { openConfirmModal, openCommentsModal } from '../store/slices/uiSlice'
import { MediaCarousel } from './MediaCarousel'

const timeAgo = (ts) => {
  if (!ts) return ''
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return `${Math.floor(diff / 604800)}w`
}

const getPostMedia = (post) => {
  if (Array.isArray(post.media)) return post.media
  if (post.mediaUrl) return [{ url: post.mediaUrl, type: post.mediaType || 'image' }]
  return []
}

/** Render caption with highlighted #hashtags and @mentions */
const CaptionText = ({ text }) => {
  if (!text) return null
  const parts = text.split(/(#\w+|@\w+)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('#') || part.startsWith('@') ? (
          <span key={i} className="text-[#00376b] font-medium cursor-pointer hover:underline">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

export const PostCard = ({ post }) => {
  const dispatch = useDispatch()
  const { uid } = useSelector((s) => s.auth)
  const users = useSelector((s) => s.users.all)
  const likedPosts = useSelector((s) => s.posts.likedPosts)
  const friends = useSelector((s) => s.friend.friends)
  const incomingRequests = useSelector((s) => s.friend.incomingRequests)
  const sentRequests = useSelector((s) => s.friend.sentRequests)

  const [commentCount, setCommentCount] = useState(post.commentCount || 0)
  const [showFullCaption, setShowFullCaption] = useState(false)

  const isOwner = post.uid === uid
  const media = getPostMedia(post)
  const isLiked = !!likedPosts[post.id]

  // listen to live comment count
  useEffect(() => {
    const unsub = onValue(ref(db, `posts/${post.id}/commentCount`), (snap) => {
      setCommentCount(snap.val() || 0)
    })
    return unsub
  }, [post.id])

  const getRelationship = (targetId) => {
    if (targetId === uid) return 'self'
    if (friends[targetId]) return 'friend'
    if (sentRequests[targetId]) return 'requested'
    if (incomingRequests[targetId]) return 'incoming'
    return 'none'
  }

  const rel = getRelationship(post.uid)
  const captionLong = post.caption && post.caption.length > 100

  return (
    <article className="border-b border-zinc-200 pb-3 sm:pb-4">
      {/* ── Post Header ── */}
      <div className="mb-2 flex items-center gap-3 px-3 sm:px-0">
        <img src={post.photoURL || 'https://i.pravatar.cc/40'} alt="" className="h-9 w-9 rounded-full object-cover" />
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-[13px] font-semibold leading-tight">
            {post.displayName || post.uid}
            <span className="ml-1.5 font-normal text-slate-400">• {timeAgo(post.createdAt)}</span>
          </p>
        </div>

        {/* relationship actions */}
        {rel === 'none' && (
          <button onClick={() => dispatch(sendFriendRequest({ targetId: post.uid }))} className="flex items-center gap-1 text-xs font-semibold text-sky-500 hover:text-sky-700">
            <UserPlus className="h-3.5 w-3.5" /> Add
          </button>
        )}
        {rel === 'requested' && (
          <button onClick={() => dispatch(cancelFriendRequest({ targetId: post.uid }))} className="flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-600">
            <Clock className="h-3.5 w-3.5" /> Requested
          </button>
        )}
        {rel === 'incoming' && (
          <button onClick={() => dispatch(acceptFriendRequest({ senderId: post.uid }))} className="flex items-center gap-1 text-xs font-semibold text-green-500 hover:text-green-600">
            <UserCheck className="h-3.5 w-3.5" /> Accept
          </button>
        )}
        {rel === 'friend' && (
          <button
            onClick={() =>
              dispatch(openConfirmModal({
                title: 'Remove Friend',
                message: `Are you sure you want to remove ${users[post.uid]?.displayName || 'this user'} from friends?`,
                action: 'unfriend',
                payload: { targetId: post.uid },
              }))
            }
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            <Users className="h-3.5 w-3.5" /> Friends
          </button>
        )}

        {/* owner delete / more */}
        {isOwner ? (
          <button
            onClick={() =>
              dispatch(openConfirmModal({
                title: 'Delete Post',
                message: 'Are you sure you want to delete this post? This action cannot be undone.',
                action: 'deletePost',
                payload: { postId: post.id, ownerId: post.uid },
              }))
            }
            className="text-red-400 transition hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : (
          <button className="text-slate-400 hover:text-slate-600">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ── Media Carousel ── */}
      <MediaCarousel media={media} />

      {/* ── Action Bar ── */}
      <div className="mt-3 flex items-center gap-4 px-3 sm:px-0">
        <button onClick={() => dispatch(toggleLike({ postId: post.id }))} className="transition active:scale-125">
          <Heart
            className={`h-6 w-6 transition ${isLiked ? 'fill-red-500 text-red-500 animate-[pulse_0.3s_ease-in-out]' : 'text-slate-900'}`}
            strokeWidth={1.8}
          />
        </button>
        <button onClick={() => dispatch(openCommentsModal(post.id))}>
          <MessageCircle className="h-6 w-6 text-slate-900" strokeWidth={1.8} />
        </button>
        <button onClick={() => dispatch(sharePost({ postId: post.id }))}>
          <Send className="h-6 w-6 text-slate-900" strokeWidth={1.8} />
        </button>
        <button className="ml-auto">
          <Bookmark className="h-6 w-6 text-slate-900" strokeWidth={1.8} />
        </button>
      </div>

      {/* ── Like Count ── */}
      <p className="mt-2 px-3 text-[13px] font-semibold sm:px-0">
        {(post.likeCount || 0).toLocaleString()} likes
      </p>

      {/* ── Caption with hashtags ── */}
      {post.caption && (
        <div className="mt-1 px-3 text-[13px] leading-snug sm:px-0">
          <span className="font-semibold">{post.displayName || post.uid}</span>{' '}
          {captionLong && !showFullCaption ? (
            <>
              <CaptionText text={post.caption.slice(0, 100)} />
              <span className="text-slate-400">... </span>
              <button onClick={() => setShowFullCaption(true)} className="text-slate-400 hover:text-slate-600">more</button>
            </>
          ) : (
            <CaptionText text={post.caption} />
          )}
        </div>
      )}

      {/* ── View Comments link (opens popup) ── */}
      <div className="mt-1 px-3 sm:px-0">
        {commentCount > 0 ? (
          <button
            onClick={() => dispatch(openCommentsModal(post.id))}
            className="text-[13px] text-slate-400 hover:text-slate-600 transition"
          >
            View all {commentCount} comment{commentCount !== 1 ? 's' : ''}
          </button>
        ) : (
          <button
            onClick={() => dispatch(openCommentsModal(post.id))}
            className="text-[13px] text-slate-400 hover:text-slate-600 transition"
          >
            Add a comment...
          </button>
        )}
      </div>

      {/* ── Timestamp ── */}
      <p className="mt-1 px-3 text-[10px] uppercase text-slate-400 sm:px-0">
        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : ''}
      </p>
    </article>
  )
}
