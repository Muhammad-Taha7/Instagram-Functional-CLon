import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { X, Image, Film } from 'lucide-react'
import { closeStoryModal } from '../store/slices/uiSlice'
import { createStory } from '../store/slices/postsSlice'

export const StoryUploadModal = () => {
  const dispatch = useDispatch()
  const showStoryModal = useSelector((s) => s.ui.showStoryModal)
  const { uid, displayName, photoURL } = useSelector((s) => s.auth)
  const uploading = useSelector((s) => s.posts.uploading)

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const safePhoto = photoURL || 'https://i.pravatar.cc/80?img=50'

  useEffect(() => {
    if (!file) { setPreview(null); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleFileChange = (e) => {
    setError('')
    const f = e.target.files?.[0]
    if (f) setFile(f)
    e.target.value = ''
  }

  const resetAndClose = () => {
    setError('')
    setFile(null)
    setPreview(null)
    dispatch(closeStoryModal())
  }

  const handleSubmit = async () => {
    if (!uid || !file) return
    setError('')
    try {
      await dispatch(createStory({ uid, displayName: displayName || 'User', photoURL: safePhoto, file })).unwrap()
      resetAndClose()
    } catch (err) {
      console.error('Story failed:', err)
      setError(err?.message || 'Failed to upload story.')
    }
  }

  if (!showStoryModal) return null

  const isVideo = file?.type?.startsWith('video')

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="relative flex w-full max-w-sm flex-col rounded-2xl bg-white shadow-xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
          <h3 className="text-base font-semibold">Add to your story</h3>
          <button onClick={resetAndClose}><X className="h-5 w-5 text-slate-600" /></button>
        </div>

        {/* body */}
        <div className="flex flex-col gap-3 p-5">
          {!file ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-72 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-300 text-slate-500 transition hover:border-zinc-400"
            >
              <div className="flex gap-3">
                <Image className="h-10 w-10" strokeWidth={1.3} />
                <Film className="h-10 w-10" strokeWidth={1.3} />
              </div>
              <span className="text-sm font-medium">Select a photo or video</span>
              <span className="text-xs text-slate-400">Your story disappears after 24 hours</span>
            </button>
          ) : (
            <div className="relative overflow-hidden rounded-xl">
              {isVideo ? (
                <video src={preview} controls className="max-h-80 w-full rounded-xl bg-black object-contain" />
              ) : (
                <img src={preview} alt="story preview" className="max-h-80 w-full rounded-xl bg-zinc-100 object-contain" />
              )}
              <button
                onClick={() => setFile(null)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* footer */}
        <div className="border-t border-zinc-200 px-5 py-3">
          <button
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="w-full rounded-lg bg-linear-to-r from-purple-500 via-pink-500 to-orange-400 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Share to Story'}
          </button>
          {error && <p className="mt-2 text-center text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  )
}
