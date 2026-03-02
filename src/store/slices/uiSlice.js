import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    showCreateModal: false,
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
  openConfirmModal,
  closeConfirmModal,
} = uiSlice.actions
export default uiSlice.reducer
