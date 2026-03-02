import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Home, Search, PlusSquare, Clapperboard } from 'lucide-react'
import { openCreateModal } from '../store/slices/uiSlice'

export const MobileBottomNav = () => {
  const dispatch = useDispatch()
  const { photoURL } = useSelector((s) => s.auth)
  const safePhoto = photoURL || 'https://i.pravatar.cc/80?img=50'

  return (
    <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-zinc-200 bg-white py-2.5 lg:hidden">
      <button><Home className="h-6 w-6" strokeWidth={2.4} /></button>
      <button><Search className="h-6 w-6" strokeWidth={1.8} /></button>
      <button onClick={() => dispatch(openCreateModal())}><PlusSquare className="h-6 w-6" strokeWidth={1.8} /></button>
      <button><Clapperboard className="h-6 w-6" strokeWidth={1.8} /></button>
      <button className="rounded-full ring-2 ring-transparent">
        <img src={safePhoto} alt="profile" className="h-7 w-7 rounded-full object-cover" />
      </button>
    </nav>
  )
}
