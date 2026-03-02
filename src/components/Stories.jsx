import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus } from 'lucide-react'
import { openStoryModal, openStoryViewer } from '../store/slices/uiSlice'

export const Stories = ({ stories, ownStories }) => {
  const dispatch = useDispatch()
  const { photoURL } = useSelector((s) => s.auth)
  const users = useSelector((s) => s.users.all)

  const safePhoto = photoURL || 'https://i.pravatar.cc/80?img=50'
  const hasOwnStory = ownStories && ownStories.length > 0

  const handleViewStory = (userIndex) => {
    dispatch(openStoryViewer({ stories, userIndex }))
  }

  const handleViewOwnStory = () => {
    if (hasOwnStory) {
      dispatch(openStoryViewer({ stories: ownStories, userIndex: 0 }))
    }
  }

  return (
    <div className="mb-4 flex gap-4 overflow-x-auto rounded-lg border border-zinc-100 bg-white px-4 py-3 shadow-sm sm:mb-6 scrollbar-hide">
      {/* own story slot */}
      <div className="flex shrink-0 flex-col items-center gap-1">
        <div className="relative">
          <button
            onClick={hasOwnStory ? handleViewOwnStory : () => dispatch(openStoryModal())}
            className="block transition hover:opacity-80"
          >
            {hasOwnStory ? (
              <div className="rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2.5px]">
                <img src={safePhoto} alt="Your story" className="h-15 w-15 rounded-full border-[2.5px] border-white object-cover" />
              </div>
            ) : (
              <img src={safePhoto} alt="Your story" className="h-16 w-16 rounded-full border-2 border-zinc-200 object-cover" />
            )}
          </button>
          {/* "+" add story button */}
          <button
            onClick={() => dispatch(openStoryModal())}
            className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-sky-500 transition hover:bg-sky-600"
          >
            <Plus className="h-3 w-3 text-white" strokeWidth={3} />
          </button>
        </div>
        <span className="w-16 truncate text-center text-[11px]">Your story</span>
      </div>

      {stories.length === 0 && (
        <p className="self-center text-xs text-slate-400">Add friends to see their stories</p>
      )}

      {stories.map((story, idx) => {
        const user = users[story.uid]
        return (
          <button
            key={`${story.uid}-${story.id}`}
            onClick={() => handleViewStory(idx)}
            className="flex shrink-0 flex-col items-center gap-1 transition hover:opacity-80"
          >
            <div className="rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2.5px]">
              <img
                src={user?.photoURL || 'https://i.pravatar.cc/80?img=15'}
                alt={user?.displayName || 'story'}
                className="h-15 w-15 rounded-full border-[2.5px] border-white object-cover"
              />
            </div>
            <span className="w-16 truncate text-center text-[11px]">{user?.displayName || 'user'}</span>
          </button>
        )
      })}
    </div>
  )
}
