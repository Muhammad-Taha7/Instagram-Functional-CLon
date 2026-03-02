import React from 'react'
import { useDispatch } from 'react-redux'
import { acceptFriendRequest, rejectFriendRequest } from '../store/slices/friendSlice'

export const FriendRequestsPanel = ({ show, requests }) => {
  const dispatch = useDispatch()

  if (!show || requests.length === 0) return null

  return (
    <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 lg:hidden">
      <p className="mb-2 text-xs font-semibold text-slate-500">Friend Requests</p>
      {requests.map((r) => (
        <div key={r.from} className="mb-2 flex items-center gap-3">
          <img src={r.fromPhoto || 'https://i.pravatar.cc/40'} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-[13px] font-semibold">{r.fromName}</p>
          </div>
          <button
            onClick={() => dispatch(acceptFriendRequest({ senderId: r.from }))}
            className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-600"
          >
            Accept
          </button>
          <button
            onClick={() => dispatch(rejectFriendRequest({ senderId: r.from }))}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-zinc-100"
          >
            Reject
          </button>
        </div>
      ))}
    </div>
  )
}
