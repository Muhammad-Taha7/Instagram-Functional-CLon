import React, { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const MediaCarousel = ({ media }) => {
  const [idx, setIdx] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  if (!media || media.length === 0) return null

  const isMulti = media.length > 1
  const item = media[idx]

  const onTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX }
  const onTouchMove = (e) => { touchEndX.current = e.targetTouches[0].clientX }
  const onTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50 && idx < media.length - 1) setIdx((i) => i + 1)
    if (diff < -50 && idx > 0) setIdx((i) => i - 1)
  }

  return (
    <div
      className="relative select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {item.type === 'video' ? (
        <video controls src={item.url} className="w-full bg-black sm:rounded-sm" style={{ maxHeight: 600 }} />
      ) : (
        <img src={item.url} alt="post" className="w-full bg-zinc-100 object-cover sm:rounded-sm" style={{ maxHeight: 600 }} />
      )}

      {/* counter badge */}
      {isMulti && (
        <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-medium text-white">
          {idx + 1}/{media.length}
        </span>
      )}

      {/* left arrow */}
      {isMulti && idx > 0 && (
        <button
          onClick={() => setIdx((i) => i - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 shadow transition hover:bg-white"
        >
          <ChevronLeft className="h-5 w-5 text-slate-700" />
        </button>
      )}

      {/* right arrow */}
      {isMulti && idx < media.length - 1 && (
        <button
          onClick={() => setIdx((i) => i + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 shadow transition hover:bg-white"
        >
          <ChevronRight className="h-5 w-5 text-slate-700" />
        </button>
      )}

      {/* dots */}
      {isMulti && (
        <div className="absolute bottom-3 flex w-full justify-center gap-1.5">
          {media.map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full transition ${i === idx ? 'bg-sky-500 scale-110' : 'bg-white/70'}`} />
          ))}
        </div>
      )}
    </div>
  )
}
