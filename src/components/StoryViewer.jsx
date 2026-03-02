import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'
import { closeStoryViewer } from '../store/slices/uiSlice'

const timeAgo = (ts) => {
  if (!ts) return ''
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export const StoryViewer = () => {
  const dispatch = useDispatch()
  const { open, stories, userIndex: initIndex } = useSelector((s) => s.ui.storyViewer)
  const users = useSelector((s) => s.users.all)

  const [currentIndex, setCurrentIndex] = useState(initIndex || 0)
  const [progress, setProgress] = useState(0)
  const [muted, setMuted] = useState(false)
  const [paused, setPaused] = useState(false)

  const holdRef = useRef(false)
  const holdTimerRef = useRef(null)
  const videoRef = useRef(null)

  const story = stories[currentIndex]
  const user = story ? users[story.uid] : null
  const isVideo = story?.media?.type === 'video'

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1)
      setProgress(0)
    } else {
      dispatch(closeStoryViewer())
    }
  }, [currentIndex, stories.length, dispatch])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setProgress(0)
    }
  }, [currentIndex])

  // Auto-progress timer (5 seconds for images)
  useEffect(() => {
    if (!open || !story || paused) return
    if (isVideo) return // video controls its own duration

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          goNext()
          return 0
        }
        return p + 2 // 50 intervals × 100ms = 5 seconds
      })
    }, 100)

    return () => clearInterval(interval)
  }, [open, story, currentIndex, goNext, paused, isVideo])

  // Reset progress on index change
  useEffect(() => {
    setProgress(0)
    setPaused(false)
  }, [currentIndex])

  // Reset index when modal opens
  useEffect(() => {
    setCurrentIndex(initIndex || 0)
  }, [initIndex, open])

  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return

    if (paused) {
      videoEl.pause()
    } else if (open && isVideo) {
      videoEl.play().catch(() => {})
    }
  }, [paused, open, isVideo, currentIndex])

  // Keyboard nav
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') dispatch(closeStoryViewer())
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, goNext, goPrev, dispatch])

  if (!open || !story) return null

  const handleHoldStart = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    holdTimerRef.current = setTimeout(() => {
      holdRef.current = true
      setPaused(true)
    }, 150)
  }

  const handleHoldEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }

    if (holdRef.current) {
      setPaused(false)
      setTimeout(() => {
        holdRef.current = false
      }, 0)
    }
  }

  const handleAdvance = () => {
    if (holdRef.current) return
    goNext()
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/95">
      {/* Close button */}
      <button
        onClick={() => dispatch(closeStoryViewer())}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Left arrow */}
      {currentIndex > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Right arrow */}
      {currentIndex < stories.length - 1 && (
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Story container */}
      <div className="relative flex h-full max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl sm:h-[85vh]">
        {/* Progress bars */}
        <div className="absolute left-0 right-0 top-0 z-10 flex gap-1 px-3 pt-3">
          {stories.map((_, i) => (
            <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white transition-all duration-100"
                style={{
                  width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* User header */}
        <div className="absolute left-0 right-0 top-4 z-10 flex items-center gap-3 px-4 pt-3">
          <img
            src={user?.photoURL || 'https://i.pravatar.cc/40'}
            alt=""
            className="h-9 w-9 rounded-full border-2 border-white object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.displayName || 'User'}</p>
            <p className="text-[11px] text-white/70">{timeAgo(story.createdAt)}</p>
          </div>
          {isVideo && (
            <button onClick={() => setMuted((m) => !m)} className="rounded-full bg-white/10 p-1.5 text-white">
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          )}
        </div>

        {/* Media */}
        <div
          className="flex h-full w-full items-center justify-center bg-black"
          onClick={handleAdvance}
          onPointerDown={handleHoldStart}
          onPointerUp={handleHoldEnd}
          onPointerLeave={handleHoldEnd}
        >
          {isVideo ? (
            <video
              key={story.id}
              src={story.media.url}
              autoPlay
              muted={muted}
              onEnded={goNext}
              playsInline
              ref={videoRef}
              className="h-full w-full object-contain"
            />
          ) : (
            <img
              key={story.id}
              src={story.media.url}
              alt="story"
              className="h-full w-full object-contain"
            />
          )}
        </div>
      </div>
    </div>
  )
}
