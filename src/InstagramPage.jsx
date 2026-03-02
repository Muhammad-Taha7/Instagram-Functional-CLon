import React, { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from './Auth/Firebase'
import {
  Home,
  Clapperboard,
  Send,
  Search,
  Compass,
  Heart,
  PlusSquare,
  Menu,
  LayoutGrid,
  MessageCircle,
  Bookmark,
} from 'lucide-react'

/* ── dummy data ─────────────────────────────────────────── */
const stories = [
  { id: 1, name: 'hamzama...', img: 'https://i.pravatar.cc/80?img=1' },
  { id: 2, name: 'mrbeast', img: 'https://i.pravatar.cc/80?img=2' },
  { id: 3, name: 'realsyedm...', img: 'https://i.pravatar.cc/80?img=3' },
  { id: 4, name: 'softiestnic...', img: 'https://i.pravatar.cc/80?img=4' },
  { id: 5, name: 'tarun_kinra', img: 'https://i.pravatar.cc/80?img=5' },
  { id: 6, name: 'daviefogar...', img: 'https://i.pravatar.cc/80?img=6' },
]

const posts = [
  {
    id: 1,
    user: 'elina_rosee23',
    avatar: 'https://i.pravatar.cc/40?img=10',
    time: '1w',
    audio: 'Original audio',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    likes: 500,
    comments: 49,
    caption: 'Sunloo merii🫶',
  },
  {
    id: 2,
    user: 'mian_faizan_786_',
    avatar: 'https://i.pravatar.cc/40?img=12',
    time: '16h',
    audio: 'Original audio',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    likes: 312,
    comments: 21,
    caption: 'Living life 🌍',
  },
]

const suggestions = [
  { id: 1, name: 'Saith', detail: 'Followed by duaarts2025 + 1', avatar: 'https://i.pravatar.cc/40?img=20' },
  { id: 2, name: 'Mirza itx🫧🥀', detail: 'Following adeem49560', avatar: 'https://i.pravatar.cc/40?img=21' },
  { id: 3, name: 'عمار', detail: 'Suggested for you', avatar: 'https://i.pravatar.cc/40?img=22' },
  { id: 4, name: 'Umar Mughal', detail: 'Following adeem49560', avatar: 'https://i.pravatar.cc/40?img=23' },
  { id: 5, name: 'Demetrius', detail: 'Suggested for you', avatar: 'https://i.pravatar.cc/40?img=24' },
]

/* ── sidebar nav items ──────────────────────────────────── */
const navItems = [
  { icon: Home, label: 'Home' },
  { icon: Clapperboard, label: 'Reels' },
  { icon: Send, label: 'Messages' },
  { icon: Search, label: 'Search' },
  { icon: Compass, label: 'Explore' },
  { icon: Heart, label: 'Notifications', badge: true },
  { icon: PlusSquare, label: 'Create' },
]

/* ── component ──────────────────────────────────────────── */
export const InstagramPage = ({ user }) => {
  const displayName = user?.displayName || user?.email || 'User'
  const photoURL = user?.photoURL || 'https://i.pravatar.cc/40?img=50'
  const [likedPosts, setLikedPosts] = useState({})

  const handleLogout = async () => {
    await signOut(auth)
  }

  const toggleLike = (postId) => {
    setLikedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }))
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-sm text-slate-900 lg:flex-row">

      {/* ── MOBILE TOP HEADER ───────────── */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2.5 lg:hidden">
        <span className="text-xl font-semibold italic">Instagram</span>
        <div className="flex items-center gap-5">
          <button><PlusSquare className="h-6 w-6" strokeWidth={1.8} /></button>
          <button className="relative">
            <Heart className="h-6 w-6" strokeWidth={1.8} />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
          </button>
        </div>
      </header>

      {/* ── DESKTOP LEFT SIDEBAR ────────── */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-18 flex-col items-center border-r border-zinc-200 bg-white py-6 lg:flex">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
          alt="Instagram"
          className="mb-7 w-7"
        />

        <nav className="flex flex-1 flex-col items-center gap-5">
          {navItems.map(({ icon: Icon, label, badge }) => (
            <button
              key={label}
              title={label}
              className="relative rounded-lg p-2 transition hover:bg-zinc-100"
            >
              <Icon className="h-6 w-6" strokeWidth={label === 'Home' ? 2.6 : 1.8} />
              {badge && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>
          ))}

          <button title="Profile" className="mt-1 rounded-full ring-2 ring-transparent hover:ring-zinc-300">
            <img src={photoURL} alt="profile" className="h-7 w-7 rounded-full object-cover" />
          </button>
        </nav>

        <div className="flex flex-col items-center gap-5 pb-2">
          <button title="Menu" className="rounded-lg p-2 transition hover:bg-zinc-100">
            <Menu className="h-6 w-6" strokeWidth={1.8} />
          </button>
          <button title="More" className="rounded-lg p-2 transition hover:bg-zinc-100">
            <LayoutGrid className="h-6 w-6" strokeWidth={1.8} />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT (center + right) ── */}
      <div className="flex flex-1 justify-center pb-16 lg:ml-18 lg:pb-0">
        <div className="flex w-full max-w-205 gap-8 px-0 py-2 sm:px-4 sm:py-6 lg:px-0">

          {/* ── CENTER FEED ────────────────── */}
          <section className="mx-auto w-full max-w-117.5">
            {/* stories */}
            <div className="mb-3 flex gap-4 overflow-x-auto px-3 pb-2 sm:mb-5 sm:px-0">
              {stories.map((s) => (
                <button key={s.id} className="flex shrink-0 flex-col items-center gap-1">
                  <div className="rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2.5px]">
                    <img
                      src={s.img}
                      alt={s.name}
                      className="h-14 w-14 rounded-full border-2 border-white object-cover"
                    />
                  </div>
                  <span className="w-16 truncate text-center text-xs">{s.name}</span>
                </button>
              ))}
            </div>

            {/* posts */}
            <div className="flex flex-col gap-2 sm:gap-4">
              {posts.map((post) => (
                <article key={post.id} className="border-b border-zinc-200 pb-3 sm:pb-4">
                  {/* post header */}
                  <div className="mb-2 flex items-center gap-3 px-3 sm:px-0">
                    <img src={post.avatar} alt={post.user} className="h-8 w-8 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold leading-tight">{post.user} <span className="font-normal text-slate-500">• {post.time}</span></p>
                      <p className="text-xs text-slate-400">{post.audio}</p>
                    </div>
                    <button className="text-slate-700">•••</button>
                  </div>

                  {/* post image */}
                  <img
                    src={post.image}
                    alt="post"
                    className="w-full bg-black object-cover sm:rounded-sm"
                    style={{ maxHeight: 585 }}
                  />

                  {/* action bar */}
                  <div className="mt-3 flex items-center gap-4 px-3 sm:px-0">
                    <button onClick={() => toggleLike(post.id)}>
                      <Heart
                        className={`h-6 w-6 transition ${likedPosts[post.id] ? 'fill-red-500 text-red-500' : 'text-slate-900'}`}
                        strokeWidth={1.8}
                      />
                    </button>
                    <button><MessageCircle className="h-6 w-6" strokeWidth={1.8} /></button>
                    <button><Send className="h-6 w-6" strokeWidth={1.8} /></button>
                    <button className="ml-auto"><Bookmark className="h-6 w-6" strokeWidth={1.8} /></button>
                  </div>

                  {/* likes & caption */}
                  <p className="mt-2 px-3 text-[13px] font-semibold sm:px-0">
                    {likedPosts[post.id] ? (post.likes + 1).toLocaleString() : post.likes.toLocaleString()} likes
                  </p>
                  <p className="mt-1 px-3 text-[13px] sm:px-0">
                    <span className="font-semibold">{post.user}</span>{' '}
                    {post.caption}{' '}
                    <button className="text-slate-400">... more</button>
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* ── RIGHT SIDEBAR (desktop only) ── */}
          <aside className="hidden w-80 shrink-0 pt-4 lg:block">
            <div className="mb-5 flex items-center gap-3">
              <img src={photoURL} alt="profile" className="h-11 w-11 rounded-full object-cover" />
              <div className="flex-1">
                <p className="text-[13px] font-semibold">{user?.email?.split('@')[0] || 'user'}</p>
                <p className="text-xs text-slate-400">{displayName}</p>
              </div>
              <button className="text-xs font-semibold text-sky-500 hover:text-sky-700" onClick={handleLogout}>
                Switch
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-slate-500">Suggested for you</p>
              <button className="text-xs font-semibold">See All</button>
            </div>
            <ul className="flex flex-col gap-3">
              {suggestions.map((s) => (
                <li key={s.id} className="flex items-center gap-3">
                  <img src={s.avatar} alt={s.name} className="h-9 w-9 rounded-full object-cover" />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-[13px] font-semibold">{s.name}</p>
                    <p className="truncate text-xs text-slate-400">{s.detail}</p>
                  </div>
                  <button className="text-xs font-semibold text-sky-500 hover:text-sky-700">Follow</button>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-[11px] leading-relaxed text-slate-300">
              About · Help · Press · API · Jobs · Privacy · Terms · Locations · Language · Meta Verified
            </p>
            <p className="mt-2 text-[11px] text-slate-300">© 2026 INSTAGRAM FROM META</p>
          </aside>
        </div>
      </div>

      {/* ── MOBILE BOTTOM TAB BAR ───────── */}
      <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-zinc-200 bg-white py-2.5 lg:hidden">
        <button><Home className="h-6 w-6" strokeWidth={2.4} /></button>
        <button><Search className="h-6 w-6" strokeWidth={1.8} /></button>
        <button><Clapperboard className="h-6 w-6" strokeWidth={1.8} /></button>
        <button><Send className="h-6 w-6" strokeWidth={1.8} /></button>
        <button className="rounded-full ring-2 ring-transparent">
          <img src={photoURL} alt="profile" className="h-7 w-7 rounded-full object-cover" />
        </button>
      </nav>
    </div>
  )
}
