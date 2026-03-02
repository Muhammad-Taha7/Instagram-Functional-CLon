import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { unfriend, acceptFriendRequest, rejectFriendRequest } from '../store/slices/friendSlice'
import { deletePost } from '../store/slices/postsSlice'
import { closeConfirmModal } from '../store/slices/uiSlice'

export const ConfirmModal = () => {
  const dispatch = useDispatch()
  const confirmModal = useSelector((s) => s.ui.confirmModal)

  const handleConfirm = () => {
    const { action, payload } = confirmModal
    if (action === 'unfriend') dispatch(unfriend(payload))
    if (action === 'deletePost') dispatch(deletePost(payload))
    if (action === 'rejectRequest') dispatch(rejectFriendRequest(payload))
    dispatch(closeConfirmModal())
  }

  if (!confirmModal.open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">{confirmModal.title}</h3>
        <p className="mt-2 text-sm text-slate-600">{confirmModal.message}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => dispatch(closeConfirmModal())} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-zinc-50">
            Cancel
          </button>
          <button onClick={handleConfirm} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
