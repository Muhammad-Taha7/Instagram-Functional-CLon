import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ref, onValue } from 'firebase/database'
import { db } from '../Auth/Firebase'
import { addComment } from '../store/slices/postsSlice'

const timeAgo = (ts) => {
  if (!ts) return ''
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return `${Math.floor(diff / 604800)}w`
}

export const CommentsSection = ({ postId }) => {
  const dispatch = useDispatch()
  const { uid, displayName, photoURL } = useSelector((s) => s.auth)
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [expanded, setExpanded] = useState(false)

  const safePhoto = photoURL || 'https://i.pravatar.cc/80?img=50'

  useEffect(() => {
    const unsub = onValue(ref(db, `postComments/${postId}`), (snap) => {
      const val = snap.val() || {}
      setComments(Object.values(val).sort((a, b) => a.createdAt - b.createdAt))
    })
    return unsub
  }, [postId])

  const handlePost = async () => {
    if (!uid || !text.trim()) return
    await dispatch(addComment({ postId, uid, displayName: displayName || 'User', photoURL: safePhoto, text: text.trim() }))
    setText('')
    if (!expanded) setExpanded(true)
  }

  const visibleComments = expanded ? comments : comments.slice(0, 2)

  return (
    <div className="mt-2 px-3 sm:px-0">
      {comments.length > 2 && !expanded && (
        <button onClick={() => setExpanded(true)} className="block mb-1 text-[12px] font-semibold text-slate-400 hover:text-slate-600 transition">
          View all {comments.length} comments ↓
        </button>
      )}
      {expanded && comments.length > 2 && (
        <button onClick={() => setExpanded(false)} className="block mb-1 text-[12px] font-semibold text-slate-400 hover:text-slate-600 transition">
          Hide comments ↑
        </button>
      )}

      {visibleComments.map((c, i) => (
        <div key={i} className="mt-2 text-[13px] flex gap-2">
          <img src={c.photoURL || 'https://i.pravatar.cc/32'} alt="" className="h-6 w-6 rounded-full object-cover shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="leading-snug">
              <span className="font-semibold text-slate-900">{c.displayName}</span> <span className="text-slate-700">{c.text}</span>
            </p>
            <span className="text-[11px] text-slate-400">{timeAgo(c.createdAt)}</span>
          </div>
        </div>
      ))}

      {/* add comment */}
      <div className="mt-3 flex items-center gap-2 border-t border-zinc-200 pt-2">
        <img src={safePhoto} alt="me" className="h-6 w-6 rounded-full object-cover" />
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePost()}
          className="w-full border-b border-zinc-200 pb-1 text-[13px] outline-none placeholder:text-slate-400"
        />
        {text.trim() && <button onClick={handlePost} className="text-[12px] font-semibold text-sky-500 hover:text-sky-700">Post</button>}
      </div>
    </div>
  )
}
