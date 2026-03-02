import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ref, onValue, push, set } from 'firebase/database'
import {
  Home, Search, Heart, PlusSquare, Menu,
  MessageCircle, X, Smile, Image as ImageIcon, ArrowLeft, Video, Send as SendIcon,
} from 'lucide-react'
import { db } from '../Auth/Firebase'
import { openCreateModal } from '../store/slices/uiSlice'
import { acceptFriendRequest, rejectFriendRequest } from '../store/slices/friendSlice'

/* ── Popular emojis grid ───────────────────────────────── */
const EMOJI_LIST = [
  '😀','😂','😍','🥰','😘','😎','🤩','🥳','😢','😭',
  '😡','🤔','🤗','🤫','🤯','😴','🤮','👻','💀','🤡',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','❣️',
  '👍','👎','👏','🙌','🤝','✌️','🤞','🤟','🫶','💪',
  '🔥','⭐','✨','🎉','🎊','💯','🏆','🎯','💎','🌈',
  '🌸','🌺','🌻','🌷','🍕','🍔','🍟','☕','🍰','🎂',
  '🐶','🐱','🐼','🦊','🦋','🐸','🐵','🦁','🐧','🐰',
  '⚽','🏀','🎮','🎵','🎬','📸','💻','📱','🚀','✈️',
]

/* ── Sticker packs (emoji-based stickers) ──────────────── */
const STICKER_LIST = [
  '🎉✨','❤️‍🔥','😂👌','🥺👉👈','💀💀💀','🫡','🤝💯','🔥🔥🔥','👀','🤷‍♂️',
  '💃🕺','🎶🎵','🙈🙉🙊','🌟⭐','🏃‍♂️💨','🤦‍♂️','👑','🦄✨','🍿👀','💪😤',
]

/* ── Nav items ─────────────────────────────────────────── */
const sidebarNav = [
  { icon: Home, label: 'Home' },
  { icon: Search, label: 'Search' },
  { icon: MessageCircle, label: 'Messages' },
  { icon: Heart, label: 'Notifications', badge: true },
  { icon: PlusSquare, label: 'Create' },
]

/* ── tiny time helper ── */
function timeAgoShort(ts) {
  if (!ts) return ''
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return 'now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

/* ── Helper: chat-room id ──────────────────────────────── */
const getChatId = (a, b) => [a, b].sort().join('_')

export const Sidebar = ({ incomingRequestsCount, mobilePanel, setMobilePanel }) => {
  const dispatch = useDispatch()
  const { photoURL } = useSelector((s) => s.auth)
  const users = useSelector((s) => s.users.all)
  const friends = useSelector((s) => s.friend.friends)
  const incomingRequests = useSelector((s) => s.friend.incomingRequests)
  const authUid = useSelector((s) => s.auth.uid)
  const safePhoto = photoURL || 'https://i.pravatar.cc/80?img=50'

  /* ── panel toggles ── */
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [mediaPreview, setMediaPreview] = useState(null) // { url, type, file }
  const [sendingMedia, setSendingMedia] = useState(false)
  const fileInputRef = useRef(null)

  /* ── unread message tracking ── */
  const [unreadCounts, setUnreadCounts] = useState({})
  const [totalUnread, setTotalUnread] = useState(0)
  const [lastSeen, setLastSeen] = useState({})

  const friendList = useMemo(() => Object.keys(friends || {}), [friends])

  /* ── search filter ── */
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return Object.values(users).slice(0, 15)
    return Object.values(users)
      .filter((u) => (u.displayName || '').toLowerCase().includes(q) || (u.uid || '').toLowerCase().includes(q))
      .slice(0, 20)
  }, [users, query])

  /* ── friend search inside chat ── */
  const [friendQuery, setFriendQuery] = useState('')
  const filteredFriends = useMemo(() => {
    const q = friendQuery.trim().toLowerCase()
    if (!q) return friendList
    return friendList.filter((fid) => {
      const u = users[fid]
      return (u?.displayName || '').toLowerCase().includes(q) || fid.toLowerCase().includes(q)
    })
  }, [friendList, friendQuery, users])

  /* ── panel toggles ── */
  const toggleSearch = () => {
    setChatOpen(false)
    setNotifOpen(false)
    setSearchOpen((s) => !s)
    if (searchOpen) setQuery('')
    if (setMobilePanel) setMobilePanel((p) => (p === 'search' ? null : 'search'))
  }
  const toggleChat = () => {
    setSearchOpen(false)
    setNotifOpen(false)
    setChatOpen((s) => !s)
    if (!chatOpen) setActiveChat(null)
    if (setMobilePanel) setMobilePanel((p) => (p === 'chat' ? null : 'chat'))
  }
  const toggleNotif = () => {
    setSearchOpen(false)
    setChatOpen(false)
    setNotifOpen((s) => !s)
    if (setMobilePanel) setMobilePanel((p) => (p === 'notifications' ? null : 'notifications'))
  }

  useEffect(() => {
    if (!mobilePanel) {
      setSearchOpen(false)
      setChatOpen(false)
      setNotifOpen(false)
      return
    }
    if (mobilePanel === 'search') {
      setSearchOpen(true)
      setChatOpen(false)
      setNotifOpen(false)
      return
    }
    if (mobilePanel === 'chat') {
      setSearchOpen(false)
      setChatOpen(true)
      setNotifOpen(false)
      return
    }
    if (mobilePanel === 'notifications') {
      setSearchOpen(false)
      setChatOpen(false)
      setNotifOpen(true)
      return
    }
    setSearchOpen(false)
    setChatOpen(false)
    setNotifOpen(false)
  }, [mobilePanel])

  /* ── friend requests list ── */
  const requestsList = useMemo(() => {
    return Object.values(incomingRequests || {}).filter((r) => r.status === 'pending')
  }, [incomingRequests])

  /* ══════════════════════════════════════════════════════════
     UNREAD NOTIFICATIONS
     ══════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!authUid || friendList.length === 0) {
      setUnreadCounts({})
      setTotalUnread(0)
      return
    }
    const unsub = onValue(ref(db, `chatLastSeen/${authUid}`), (snap) => {
      setLastSeen(snap.val() || {})
    })
    return unsub
  }, [authUid, friendList.length])

  useEffect(() => {
    if (!authUid || friendList.length === 0) return
    const unsubs = []
    const counts = {}
    friendList.forEach((fid) => {
      const cid = getChatId(authUid, fid)
      const unsub = onValue(ref(db, `messages/${cid}`), (snap) => {
        const val = snap.val() || {}
        const msgs = Object.values(val)
        const seenTs = lastSeen[cid] || 0
        const unread = msgs.filter((m) => m.from !== authUid && (m.createdAt || 0) > seenTs).length
        counts[fid] = unread
        setUnreadCounts({ ...counts })
        setTotalUnread(Object.values(counts).reduce((a, b) => a + b, 0))
      })
      unsubs.push(unsub)
    })
    return () => unsubs.forEach((u) => u())
  }, [authUid, friendList, lastSeen])

  const markSeen = useCallback(async (fid) => {
    if (!authUid || !fid) return
    const cid = getChatId(authUid, fid)
    await set(ref(db, `chatLastSeen/${authUid}/${cid}`), Date.now())
  }, [authUid])

  /* ── active chat messages listener ── */
  useEffect(() => {
    if (!chatOpen || !activeChat || !authUid) return
    const cid = getChatId(authUid, activeChat)
    const unsub = onValue(ref(db, `messages/${cid}`), (snap) => {
      const val = snap.val() || {}
      setMessages(Object.values(val).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)))
    })
    markSeen(activeChat)
    return unsub
  }, [chatOpen, activeChat, authUid, markSeen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (activeChat && chatOpen && messages.length > 0) markSeen(activeChat)
  }, [messages.length, activeChat, chatOpen, markSeen])

  const handleSelectChat = (uid) => {
    setActiveChat(uid)
    markSeen(uid)
  }

  const handleSend = async () => {
    const text = chatInput.trim()
    if (!text && !mediaPreview) return
    if (!activeChat || !authUid) return
    const cid = getChatId(authUid, activeChat)

    if (mediaPreview) {
      setSendingMedia(true)
      try {
        await push(ref(db, `messages/${cid}`), {
          from: authUid,
          to: activeChat,
          text: text || '',
          media: { url: mediaPreview.url, type: mediaPreview.type },
          createdAt: Date.now(),
        })
      } finally {
        setSendingMedia(false)
        setMediaPreview(null)
      }
    } else {
      await push(ref(db, `messages/${cid}`), {
        from: authUid,
        to: activeChat,
        text,
        createdAt: Date.now(),
      })
    }
    setChatInput('')
    setShowEmojiPicker(false)
    setShowStickerPicker(false)
    markSeen(activeChat)
  }

  const handleSendSticker = async (sticker) => {
    if (!activeChat || !authUid) return
    const cid = getChatId(authUid, activeChat)
    await push(ref(db, `messages/${cid}`), {
      from: authUid,
      to: activeChat,
      text: sticker,
      isSticker: true,
      createdAt: Date.now(),
    })
    setShowStickerPicker(false)
    setShowEmojiPicker(false)
    markSeen(activeChat)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isVideo = file.type.startsWith('video')
    const isImage = file.type.startsWith('image')
    if (!isVideo && !isImage) return
    if (file.size > 10 * 1024 * 1024) { alert('File must be under 10MB'); return }
    const reader = new FileReader()
    reader.onload = () => {
      setMediaPreview({ url: reader.result, type: isVideo ? 'video' : 'image', file })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleInsertEmoji = (emoji) => {
    setChatInput((prev) => prev + emoji)
  }

  /* ── last message preview per friend ── */
  const [previews, setPreviews] = useState({})
  useEffect(() => {
    if (!authUid || friendList.length === 0) return
    const unsubs = []
    const data = {}
    friendList.forEach((fid) => {
      const cid = getChatId(authUid, fid)
      const unsub = onValue(ref(db, `messages/${cid}`), (snap) => {
        const val = snap.val() || {}
        const arr = Object.values(val).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        data[fid] = arr[0] || null
        setPreviews({ ...data })
      })
      unsubs.push(unsub)
    })
    return () => unsubs.forEach((u) => u())
  }, [authUid, friendList])

  /* ══════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════ */
  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-18 flex-col items-center border-r border-zinc-100 bg-white py-5 lg:flex">
      {/* Logo */}
      <div className="mb-8 flex h-8 w-8 items-center justify-center">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
          alt="Instagram"
          className="w-7 transition hover:scale-110"
        />
      </div>

      {/* Nav icons */}
      <nav className="flex flex-1 flex-col items-center gap-2">
        {sidebarNav.map(({ icon: Icon, label, badge }) => {
          const isActive = (label === 'Search' && searchOpen) || (label === 'Messages' && chatOpen) || (label === 'Notifications' && notifOpen)
          return (
            <button
              key={label}
              title={label}
              onClick={
                label === 'Create' ? () => dispatch(openCreateModal())
                : label === 'Search' ? toggleSearch
                : label === 'Messages' ? toggleChat
                : label === 'Notifications' ? toggleNotif
                : undefined
              }
              className={`relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200
                ${isActive ? 'bg-zinc-100 shadow-sm' : 'hover:bg-zinc-50'}
              `}
            >
              <Icon className={`h-5.5 w-5.5 ${label === 'Home' ? 'stroke-[2.4]' : 'stroke-[1.6]'} ${isActive ? 'text-black' : 'text-zinc-700'}`} />

              {/* Notification badge */}
              {badge && incomingRequestsCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                  {incomingRequestsCount}
                </span>
              )}

              {/* Messages unread badge */}
              {label === 'Messages' && totalUnread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </button>
          )
        })}

        {/* Profile */}
        <button title="Profile" className="mt-2 rounded-full ring-2 ring-transparent transition hover:ring-zinc-300">
          <img src={safePhoto} alt="profile" className="h-7 w-7 rounded-full object-cover" />
        </button>
      </nav>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-2 pb-2">
        <button title="Menu" className="flex h-12 w-12 items-center justify-center rounded-xl transition hover:bg-zinc-50">
          <Menu className="h-5.5 w-5.5 stroke-[1.6] text-zinc-700" />
        </button>
      </div>
    </aside>

      {/* ═══════ NOTIFICATIONS PANEL ═══════ */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white shadow-xl lg:fixed lg:top-0 lg:left-18 lg:h-screen lg:w-96 lg:border-r lg:border-zinc-100">
          <div className="border-b border-zinc-100 px-5 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Notifications</h2>
              <button onClick={toggleNotif} className="rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {/* Friend Requests section */}
            {requestsList.length > 0 && (
              <div className="border-b border-zinc-50 px-5 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-zinc-900">Friend Requests</p>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {requestsList.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {requestsList.map((r) => (
                    <div key={r.from} className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3">
                      <img
                        src={r.fromPhoto || users[r.from]?.photoURL || 'https://i.pravatar.cc/40'}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-zinc-900">{r.fromName || users[r.from]?.displayName || 'User'}</p>
                        <p className="text-[11px] text-zinc-400">wants to be your friend</p>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => dispatch(acceptFriendRequest({ senderId: r.from }))}
                            className="rounded-lg bg-blue-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => dispatch(rejectFriendRequest({ senderId: r.from }))}
                            className="rounded-lg border border-zinc-200 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {requestsList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                <Heart className="mb-3 h-12 w-12 stroke-1" />
                <p className="text-sm font-medium text-zinc-600">No notifications</p>
                <p className="mt-1 text-xs text-zinc-400">When someone sends you a friend request, it'll show up here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ SEARCH PANEL ═══════ */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white shadow-xl lg:fixed lg:top-0 lg:left-18 lg:h-screen lg:w-80 lg:border-r lg:border-zinc-100">
          <div className="border-b border-zinc-100 px-5 py-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">Search</h2>
              <button onClick={toggleSearch} className="rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex items-center rounded-lg bg-zinc-50 px-3">
              <Search className="h-4 w-4 text-zinc-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="rounded-full bg-zinc-300 p-0.5">
                  <X className="h-3 w-3 text-white" />
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {filteredUsers.length === 0 && (
              <p className="py-12 text-center text-sm text-zinc-400">No results found.</p>
            )}
            {filteredUsers.map((u) => (
              <div key={u.uid} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-zinc-50">
                <img src={u.photoURL || 'https://i.pravatar.cc/60'} alt="" className="h-11 w-11 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-zinc-900">{u.displayName || 'User'}</p>
                  <p className="truncate text-xs text-zinc-400">{u.email || u.uid}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════ CHAT PANEL ═══════ */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white shadow-xl lg:fixed lg:top-0 lg:left-18 lg:h-screen lg:w-105 lg:border-r lg:border-zinc-100">
          {!activeChat ? (
            /* ── Friend list view ── */
            <>
              <div className="border-b border-zinc-100 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900">Messages</h2>
                  <button onClick={toggleChat} className="rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-3 flex items-center rounded-lg bg-zinc-50 px-3">
                  <Search className="h-4 w-4 text-zinc-400" />
                  <input
                    value={friendQuery}
                    onChange={(e) => setFriendQuery(e.target.value)}
                    placeholder="Search friends"
                    className="w-full bg-transparent px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredFriends.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                    <MessageCircle className="mb-3 h-12 w-12 stroke-1" />
                    <p className="text-sm font-medium">No conversations</p>
                    <p className="mt-1 text-xs">Add friends to start messaging</p>
                  </div>
                )}
                {filteredFriends.map((fid) => {
                  const u = users[fid]
                  const preview = previews[fid]
                  const unread = unreadCounts[fid] || 0
                  return (
                    <button
                      key={fid}
                      onClick={() => handleSelectChat(fid)}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-zinc-50"
                    >
                      <div className="relative shrink-0">
                        <img src={u?.photoURL || 'https://i.pravatar.cc/60'} alt="" className="h-14 w-14 rounded-full object-cover" />
                        {unread > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                            {unread}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-[14px] ${unread > 0 ? 'font-bold text-zinc-900' : 'font-semibold text-zinc-800'}`}>
                          {u?.displayName || 'User'}
                        </p>
                        {preview ? (
                          <p className={`mt-0.5 truncate text-xs ${unread > 0 ? 'font-semibold text-zinc-600' : 'text-zinc-400'}`}>
                            {preview.from === authUid ? 'You: ' : ''}
                            {preview.media ? (preview.media.type === 'video' ? '🎬 Video' : '📷 Photo') : preview.isSticker ? preview.text : preview.text}
                            <span className="ml-1.5 text-zinc-300">·</span>
                            <span className="ml-1 text-zinc-300">{timeAgoShort(preview.createdAt)}</span>
                          </p>
                        ) : (
                          <p className="mt-0.5 text-xs text-zinc-400">Start a conversation</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            /* ── Active chat view ── */
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
                <button
                  onClick={() => setActiveChat(null)}
                  className="rounded-full p-1.5 text-zinc-500 transition hover:bg-zinc-100"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <img src={users[activeChat]?.photoURL || 'https://i.pravatar.cc/60'} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-zinc-900">{users[activeChat]?.displayName || 'User'}</p>
                  <p className="text-[11px] text-zinc-400">Active now</p>
                </div>
                <button onClick={toggleChat} className="rounded-full p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                    <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 border-zinc-200">
                      <img src={users[activeChat]?.photoURL || 'https://i.pravatar.cc/60'} alt="" className="h-16 w-16 rounded-full object-cover" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-900">{users[activeChat]?.displayName}</p>
                    <p className="mt-1 text-xs text-zinc-400">Send a message to start chatting</p>
                  </div>
                )}
                {messages.map((m, idx) => {
                  const isMine = m.from === authUid
                  const showAvatar = !isMine && (idx === 0 || messages[idx - 1]?.from !== m.from)
                  const hasMedia = m.media?.url
                  const isSticker = m.isSticker
                  return (
                    <div key={idx} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {!isMine && (
                        <div className="w-7 shrink-0">
                          {showAvatar && (
                            <img src={users[activeChat]?.photoURL || 'https://i.pravatar.cc/40'} alt="" className="h-7 w-7 rounded-full object-cover" />
                          )}
                        </div>
                      )}

                      {/* Sticker message */}
                      {isSticker ? (
                        <div className="flex flex-col items-end">
                          <span className="text-4xl leading-none">{m.text}</span>
                          <p className="mt-1 text-[10px] text-zinc-400">
                            {new Date(m.createdAt || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ) : (
                        <div
                          className={`max-w-[65%] overflow-hidden rounded-2xl text-[13px] leading-relaxed
                            ${hasMedia ? 'p-0' : 'px-3.5 py-2'}
                            ${isMine
                              ? hasMedia ? '' : 'bg-linear-to-br from-blue-500 to-blue-600 text-white'
                              : hasMedia ? '' : 'bg-zinc-100 text-zinc-900'
                            }
                          `}
                        >
                          {/* Media content */}
                          {hasMedia && (
                            <div className="relative">
                              {m.media.type === 'video' ? (
                                <video
                                  src={m.media.url}
                                  controls
                                  playsInline
                                  className="max-h-60 w-full rounded-2xl object-cover"
                                />
                              ) : (
                                <img
                                  src={m.media.url}
                                  alt="shared"
                                  className="max-h-60 w-full cursor-pointer rounded-2xl object-cover transition hover:opacity-90"
                                  onClick={() => window.open(m.media.url, '_blank')}
                                />
                              )}
                            </div>
                          )}

                          {/* Text below media or standalone */}
                          {m.text && (
                            <p className={`${hasMedia ? 'px-3.5 pt-1.5 pb-0.5' : ''} ${hasMedia ? (isMine ? 'text-zinc-900' : 'text-zinc-900') : ''}`}>{m.text}</p>
                          )}
                          <p className={`${hasMedia ? 'px-3.5 pb-2' : 'mt-0.5'} text-[10px] ${isMine && !hasMedia ? 'text-blue-100' : 'text-zinc-400'}`}>
                            {new Date(m.createdAt || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Emoji picker */}
              {showEmojiPicker && (
                <div className="border-t border-zinc-100 bg-white">
                  <div className="flex items-center gap-1 border-b border-zinc-50 px-3 py-1.5">
                    <button
                      onClick={() => { setShowEmojiPicker(true); setShowStickerPicker(false) }}
                      className={`rounded-md px-3 py-1 text-xs font-semibold transition ${!showStickerPicker ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >Emoji</button>
                    <button
                      onClick={() => { setShowStickerPicker(true) }}
                      className={`rounded-md px-3 py-1 text-xs font-semibold transition ${showStickerPicker ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >Stickers</button>
                  </div>
                  {!showStickerPicker ? (
                    <div className="grid max-h-40 grid-cols-8 gap-0.5 overflow-y-auto p-2 scrollbar-hide">
                      {EMOJI_LIST.map((e) => (
                        <button
                          key={e}
                          onClick={() => handleInsertEmoji(e)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-xl transition hover:bg-zinc-100"
                        >{e}</button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid max-h-40 grid-cols-5 gap-1 overflow-y-auto p-2 scrollbar-hide">
                      {STICKER_LIST.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendSticker(s)}
                          className="flex h-12 items-center justify-center rounded-lg text-2xl transition hover:bg-zinc-100"
                        >{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Media preview */}
              {mediaPreview && (
                <div className="relative border-t border-zinc-100 bg-zinc-50 p-3">
                  <button
                    onClick={() => setMediaPreview(null)}
                    className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {mediaPreview.type === 'video' ? (
                    <video src={mediaPreview.url} controls className="max-h-36 w-full rounded-xl object-cover" />
                  ) : (
                    <img src={mediaPreview.url} alt="preview" className="max-h-36 w-full rounded-xl object-cover" />
                  )}
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Input bar */}
              <div className="border-t border-zinc-100 px-4 py-3">
                <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1">
                  <button
                    onClick={() => { setShowEmojiPicker((v) => !v); setShowStickerPicker(false) }}
                    className={`rounded-full p-1 transition ${showEmojiPicker ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    onFocus={() => { setShowEmojiPicker(false); setShowStickerPicker(false) }}
                    placeholder="Message..."
                    className="flex-1 bg-transparent py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full p-1 text-zinc-400 transition hover:text-zinc-600"
                    title="Send image or video"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </button>
                  {(chatInput.trim() || mediaPreview) && (
                    <button
                      onClick={handleSend}
                      disabled={sendingMedia}
                      className="text-sm font-semibold text-blue-500 transition hover:text-blue-600 disabled:opacity-50"
                    >
                      {sendingMedia ? '...' : 'Send'}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
