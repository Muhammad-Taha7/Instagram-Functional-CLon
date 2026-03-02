import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Heart, MessageCircle, Send, Bookmark, Trash2, UserPlus, UserCheck, Clock, Users } from 'lucide-react'
import { toggleLike, sharePost, deletePost } from '../store/slices/postsSlice'
import { sendFriendRequest, cancelFriendRequest, acceptFriendRequest, unfriend } from '../store/slices/friendSlice'
import { openConfirmModal } from '../store/slices/uiSlice'
import { MediaCarousel } from './MediaCarousel'
import { CommentsSection } from './CommentsSection'

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

export const PostCard = ({ post }) => {
  const dispatch = useDispatch()
  const { uid } = useSelector((s) => s.auth)
  const users = useSelector((s) => s.users.all)
  const likedPosts = useSelector((s) => s.posts.likedPosts)
  const friends = useSelector((s) => s.friend.friends)
  const incomingRequests = useSelector((s) => s.friend.incomingRequests)
  const sentRequests = useSelector((s) => s.friend.sentRequests)

  const isOwner = post.uid === uid
  const media = getPostMedia(post)

  const getRelationship = (targetId) => {
    if (targetId === uid) return 'self'
    if (friends[targetId]) return 'friend'
    if (sentRequests[targetId]) return 'requested'
    if (incomingRequests[targetId]) return 'incoming'
    return 'none'
  }

  const rel = getRelationship(post.uid)

  return (
    <article className="border-b border-zinc-200 pb-3 sm:pb-4">
      {/* post header */}
      <div className="mb-2 flex items-center gap-3 px-3 sm:px-0">
        <img src={post.photoURL || 'https://i.pravatar.cc/40'} alt="" className="h-8 w-8 rounded-full object-cover" />
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

        {/* owner‑only delete */}
        {isOwner && (
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
        )}
      </div>

      {/* ── media carousel ── */}
      <MediaCarousel media={media} />

      {/* action bar */}
      <div className="mt-3 flex items-center gap-4 px-3 sm:px-0">
        <button onClick={() => dispatch(toggleLike({ postId: post.id }))}>
          <Heart
            className={`h-6 w-6 transition ${likedPosts[post.id] ? 'fill-red-500 text-red-500' : 'text-slate-900'}`}
            strokeWidth={1.8}
          />
        </button>
        <button><MessageCircle className="h-6 w-6" strokeWidth={1.8} /></button>
        <button onClick={() => dispatch(sharePost({ postId: post.id }))}><Send className="h-6 w-6" strokeWidth={1.8} /></button>
        <button className="ml-auto"><Bookmark className="h-6 w-6" strokeWidth={1.8} /></button>
      </div>

      {/* like count */}
      <p className="mt-2 px-3 text-[13px] font-semibold sm:px-0">{(post.likeCount || 0).toLocaleString()} likes</p>

      {/* caption */}
      {post.caption && (
        <p className="mt-1 px-3 text-[13px] sm:px-0">
          <span className="font-semibold">{post.displayName || post.uid}</span> {post.caption}
        </p>
      )}

      {/* comments */}
      <CommentsSection postId={post.id} />
    </article>
  )
}
