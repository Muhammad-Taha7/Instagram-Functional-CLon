import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Image, Film, ChevronLeft, ChevronRight, PlusSquare } from 'lucide-react'
import { closeCreateModal } from '../store/slices/uiSlice'
import { createPost } from '../store/slices/postsSlice'

export const CreatePostModal = () => {
  const dispatch = useDispatch()
  const showCreateModal = useSelector((s) => s.ui.showCreateModal)
  const { uid, displayName, photoURL } = useSelector((s) => s.auth)
  const uploading = useSelector((s) => s.posts.uploading)

  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [previewIdx, setPreviewIdx] = useState(0)
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const safePhoto = photoURL || 'https://i.pravatar.cc/80?img=50'

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    setPreviewIdx(0)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  const handleAddFiles = (e) => {
    setError('')
    const newFiles = Array.from(e.target.files || [])
    if (newFiles.length > 0) setFiles((prev) => [...prev, ...newFiles])
    e.target.value = ''
  }

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviewIdx(0)
  }

  const resetAndClose = () => {
    setError('')
    setFiles([])
    setCaption('')
    dispatch(closeCreateModal())
  }

  const handleSubmit = async () => {
    if (!uid || files.length === 0) return
    setError('')
    try {
      await dispatch(createPost({ uid, displayName: displayName || 'User', photoURL: safePhoto, caption, files })).unwrap()
      resetAndClose()
    } catch (err) {
      console.error('Post failed:', err)
      setError(err?.message || 'Failed to post. Please try again.')
    }
  }

  if (!showCreateModal) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="relative flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
          <h3 className="text-base font-semibold">Create new post</h3>
          <button onClick={resetAndClose}><X className="h-5 w-5 text-slate-600" /></button>
        </div>

        {/* body */}
        <div className="flex flex-col gap-3 p-5">
          {files.length === 0 ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-60 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 text-slate-500 transition hover:border-zinc-400"
            >
              <div className="flex gap-2">
                <Image className="h-8 w-8" strokeWidth={1.4} />
                <Film className="h-8 w-8" strokeWidth={1.4} />
              </div>
              <span className="text-sm">Select photos and videos</span>
            </button>
          ) : (
            <div className="relative">
              {files[previewIdx]?.type.startsWith('video') ? (
                <video src={previews[previewIdx]} controls className="max-h-72 w-full rounded-xl bg-black object-contain" />
              ) : (
                <img src={previews[previewIdx]} alt="preview" className="max-h-72 w-full rounded-xl bg-zinc-100 object-contain" />
              )}

              {files.length > 1 && previewIdx > 0 && (
                <button onClick={() => setPreviewIdx((i) => i - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80">
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              {files.length > 1 && previewIdx < files.length - 1 && (
                <button onClick={() => setPreviewIdx((i) => i + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80">
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}

              {files.length > 1 && (
                <div className="absolute bottom-2 flex w-full justify-center gap-1">
                  {files.map((_, i) => (
                    <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === previewIdx ? 'bg-sky-500' : 'bg-white/60'}`} />
                  ))}
                </div>
              )}

              <button onClick={() => handleRemoveFile(previewIdx)} className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleAddFiles} />

          {/* thumbnail strip + add more */}
          {files.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto">
              {files.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewIdx(i)}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${i === previewIdx ? 'border-sky-500' : 'border-zinc-200'}`}
                >
                  {f.type.startsWith('video') ? (
                    <div className="flex h-full w-full items-center justify-center bg-black text-white"><Film className="h-5 w-5" /></div>
                  ) : (
                    <img src={previews[i]} alt="" className="h-full w-full object-cover" />
                  )}
                </button>
              ))}
              <button
                onClick={() => fileRef.current?.click()}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 text-slate-400 hover:border-zinc-400"
              >
                <PlusSquare className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* caption */}
          <div className="flex items-start gap-3">
            <img src={safePhoto} alt="me" className="mt-1 h-8 w-8 rounded-full object-cover" />
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption... Use #hashtags and @mentions"
              className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            />
          </div>
        </div>

        {/* footer */}
        <div className="border-t border-zinc-200 px-5 py-3">
          <button
            onClick={handleSubmit}
            disabled={files.length === 0 || uploading}
            className="w-full rounded-lg bg-sky-500 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? 'Posting...' : 'Share'}
          </button>
          {error && <p className="mt-2 text-center text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  )
}
