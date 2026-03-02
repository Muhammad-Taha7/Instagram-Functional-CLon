import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    showCreateModal: false,
    showStoryModal: false,
    commentsModal: { open: false, postId: null },
    storyViewer: { open: false, stories: [], userIndex: 0 },
    confirmModal: {
      open: false,
      title: '',
      message: '',
      action: null,
      payload: null,
    },
  },
  reducers: {
    openCreateModal(state) {
      state.showCreateModal = true
    },
    closeCreateModal(state) {
      state.showCreateModal = false
    },
    openStoryModal(state) {
      state.showStoryModal = true
    },
    closeStoryModal(state) {
      state.showStoryModal = false
    },
    openCommentsModal(state, action) {
      state.commentsModal = { open: true, postId: action.payload }
    },
    closeCommentsModal(state) {
      state.commentsModal = { open: false, postId: null }
    },
    openStoryViewer(state, action) {
      state.storyViewer = { open: true, ...action.payload }
    },
    closeStoryViewer(state) {
      state.storyViewer = { open: false, stories: [], userIndex: 0 }
    },
    openConfirmModal(state, action) {
      state.confirmModal = { open: true, ...action.payload }
    },
    closeConfirmModal(state) {
      state.confirmModal = { open: false, title: '', message: '', action: null, payload: null }
    },
  },
})

export const {
  openCreateModal,
  closeCreateModal,
  openStoryModal,
  closeStoryModal,
  openCommentsModal,
  closeCommentsModal,
  openStoryViewer,
  closeStoryViewer,
  openConfirmModal,
  closeConfirmModal,
} = uiSlice.actions
export default uiSlice.reducer
