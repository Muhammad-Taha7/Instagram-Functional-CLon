import React from 'react'
import { useSelector } from 'react-redux'

export const Stories = ({ stories }) => {
  const { photoURL } = useSelector((s) => s.auth)
  const users = useSelector((s) => s.users.all)

  const safePhoto = photoURL || 'https://i.pravatar.cc/80?img=50'

  return (
    <div className="mb-3 flex gap-4 overflow-x-auto border-b border-zinc-100 px-3 pb-3 sm:mb-5 sm:px-0">
      {/* own story placeholder */}
      <button className="flex shrink-0 flex-col items-center gap-1">
        <div className="relative">
          <img src={safePhoto} alt="Your story" className="h-14 w-14 rounded-full border-2 border-zinc-200 object-cover" />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-sky-500 text-[10px] font-bold text-white">+</span>
        </div>
        <span className="w-16 truncate text-center text-xs">Your story</span>
      </button>

      {stories.length === 0 && <p className="self-center text-xs text-slate-400">Add friends to see their stories</p>}
      
      {stories.map((p) => (
        <button key={p.uid} className="flex shrink-0 flex-col items-center gap-1">
          <div className="rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2.5px]">
            <img
              src={users[p.uid]?.photoURL || 'https://i.pravatar.cc/80?img=15'}
              alt={users[p.uid]?.displayName || 'story'}
              className="h-14 w-14 rounded-full border-2 border-white object-cover"
            />
          </div>
          <span className="w-16 truncate text-center text-xs">{users[p.uid]?.displayName || 'user'}</span>
        </button>
      ))}
    </div>
  )
}
