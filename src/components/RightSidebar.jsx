import React from 'react'
import { useDispatch } from 'react-redux'
import { signOut } from 'firebase/auth'
import { auth } from '../Auth/Firebase'
import { acceptFriendRequest, rejectFriendRequest, unfriend, sendFriendRequest, cancelFriendRequest } from '../store/slices/friendSlice'
import { openConfirmModal } from '../store/slices/uiSlice'

export const RightSidebar = ({ users, friends, incomingRequests, sentRequests, uid, email, displayName, photoURL, suggestions }) => {
  const dispatch = useDispatch()

  const handleLogout = () => signOut(auth)
  const incomingList = Object.values(incomingRequests).filter((r) => r.status === 'pending')
  const friendList = Object.values(users).filter((u) => u.uid !== uid && friends[u.uid])

  const getRelationship = (targetId) => {
    if (targetId === uid) return 'self'
    if (friends[targetId]) return 'friend'
    if (sentRequests[targetId]) return 'requested'
    if (incomingRequests[targetId]) return 'incoming'
    return 'none'
  }

  return (
    <aside className="hidden w-80 shrink-0 pt-4 lg:block">
      {/* current user */}
      <div className="mb-5 flex items-center gap-3">
        <img src={photoURL || 'https://i.pravatar.cc/80?img=50'} alt="profile" className="h-11 w-11 rounded-full object-cover" />
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-[13px] font-semibold">{email?.split('@')[0] || 'user'}</p>
          <p className="truncate text-xs text-slate-400">{displayName}</p>
        </div>
        <button className="text-xs font-semibold text-sky-500 hover:text-sky-700" onClick={handleLogout}>Log out</button>
      </div>

      {/* ── friend requests ── */}
      {incomingList.length > 0 && (
        <>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-slate-500">Friend Requests</p>
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{incomingList.length}</span>
          </div>
          <ul className="mb-4 flex flex-col gap-2.5">
            {incomingList.map((r) => (
              <li key={r.from} className="flex items-center gap-3">
                <img src={r.fromPhoto || 'https://i.pravatar.cc/40'} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-[13px] font-semibold">{r.fromName}</p>
                </div>
                <button onClick={() => dispatch(acceptFriendRequest({ senderId: r.from }))} className="rounded-md bg-sky-500 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-sky-600">
                  Accept
                </button>
                <button onClick={() => dispatch(rejectFriendRequest({ senderId: r.from }))} className="rounded-md border border-zinc-300 px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:bg-zinc-100">
                  Reject
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ── friends list ── */}
      {friendList.length > 0 && (
        <>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-slate-500">Friends</p>
          </div>
          <ul className="mb-4 flex flex-col gap-2.5">
            {friendList.map((u) => (
              <li key={u.uid} className="flex items-center gap-3">
                <img src={u.photoURL || 'https://i.pravatar.cc/40'} alt="" className="h-8 w-8 rounded-full object-cover" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-[13px] font-semibold">{u.displayName || u.email}</p>
                </div>
                <button
                  className="text-xs font-medium text-slate-500 hover:text-red-500"
                  onClick={() =>
                    dispatch(openConfirmModal({
                      title: 'Remove Friend',
                      message: `Are you sure you want to remove ${u.displayName || 'this user'} from friends?`,
                      action: 'unfriend',
                      payload: { targetId: u.uid },
                    }))
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ── suggestions ── */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-slate-500">Suggested for you</p>
        <button className="text-xs font-semibold">See All</button>
      </div>
      {suggestions.length === 0 && <p className="text-xs text-slate-400">No suggestions right now.</p>}
      <ul className="flex flex-col gap-3">
        {suggestions.map((s) => {
          const sRel = getRelationship(s.uid)
          return (
            <li key={s.uid} className="flex items-center gap-3">
              <img src={s.photoURL || 'https://i.pravatar.cc/40?img=22'} alt="" className="h-9 w-9 rounded-full object-cover" />
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-[13px] font-semibold">{s.displayName || s.email}</p>
                <p className="truncate text-xs text-slate-400">Suggested for you</p>
              </div>
              {sRel === 'none' && (
                <button className="text-xs font-semibold text-sky-500 hover:text-sky-700" onClick={() => dispatch(sendFriendRequest({ targetId: s.uid }))}>
                  Add Friend
                </button>
              )}
              {sRel === 'requested' && (
                <button className="text-xs font-medium text-amber-500 hover:text-amber-600" onClick={() => dispatch(cancelFriendRequest({ targetId: s.uid }))}>
                  Requested
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <p className="mt-6 text-[11px] leading-relaxed text-slate-300">
        About · Help · Press · API · Jobs · Privacy · Terms · Locations · Language · Meta Verified
      </p>
      <p className="mt-2 text-[11px] text-slate-300">© 2026 INSTAGRAM FROM META</p>
    </aside>
  )
}
