import React from 'react'
import { useDispatch } from 'react-redux'
import { PlusSquare, Heart } from 'lucide-react'
import { openCreateModal } from '../store/slices/uiSlice'

export const FeedHeader = ({ onShowMobileRequests, incomingRequestsCount }) => {
  const dispatch = useDispatch()

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-100 bg-white/95 backdrop-blur-md px-4 py-2.5 lg:hidden">
      <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-pink-500 via-red-500 to-amber-500 bg-clip-text text-transparent">Instagram</span>
      <div className="flex items-center gap-5">
        <button onClick={() => dispatch(openCreateModal())}><PlusSquare className="h-6 w-6" strokeWidth={1.8} /></button>
        <button className="relative" onClick={() => onShowMobileRequests((p) => !p)}>
          <Heart className="h-6 w-6" strokeWidth={1.8} />
          {incomingRequestsCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {incomingRequestsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
