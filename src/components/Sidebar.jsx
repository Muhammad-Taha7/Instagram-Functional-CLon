import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Home, Clapperboard, Send, Search, Compass, Heart, PlusSquare, Menu, LayoutGrid } from 'lucide-react'
import { openCreateModal } from '../store/slices/uiSlice'

const sidebarNav = [
  { icon: Home, label: 'Home' },
  { icon: Search, label: 'Search' },
  { icon: Heart, label: 'Notifications', badge: true },
  { icon: PlusSquare, label: 'Create' },
]

export const Sidebar = ({ incomingRequestsCount }) => {
  const dispatch = useDispatch()
  const { photoURL } = useSelector((s) => s.auth)
  const safePhoto = photoURL || 'https://i.pravatar.cc/80?img=50'

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-18 flex-col items-center border-r border-zinc-200 bg-white py-6 lg:flex">
      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" className="mb-7 w-7" />
      <nav className="flex flex-1 flex-col items-center gap-5">
        {sidebarNav.map(({ icon: Icon, label, badge }) => (
          <button
            key={label}
            title={label}
            onClick={label === 'Create' ? () => dispatch(openCreateModal()) : undefined}
            className="relative rounded-lg p-2 transition hover:bg-zinc-100"
          >
            <Icon className="h-6 w-6" strokeWidth={label === 'Home' ? 2.6 : 1.8} />
            {badge && incomingRequestsCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {incomingRequestsCount}
              </span>
            )}
          </button>
        ))}
        <button title="Profile" className="mt-1 rounded-full ring-2 ring-transparent hover:ring-zinc-300">
          <img src={safePhoto} alt="profile" className="h-7 w-7 rounded-full object-cover" />
        </button>
      </nav>
      <div className="flex flex-col items-center gap-5 pb-2">
        <button title="Menu" className="rounded-lg p-2 transition hover:bg-zinc-100"><Menu className="h-6 w-6" strokeWidth={1.8} /></button>
        <button title="More" className="rounded-lg p-2 transition hover:bg-zinc-100"><LayoutGrid className="h-6 w-6" strokeWidth={1.8} /></button>
      </div>
    </aside>
  )
}
