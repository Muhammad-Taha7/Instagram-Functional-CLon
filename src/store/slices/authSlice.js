import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    uid: null,
    email: null,
    displayName: null,
    photoURL: null,
  },
  reducers: {
    setAuthUser(state, action) {
      const { uid, email, displayName, photoURL } = action.payload
      state.uid = uid ?? null
      state.email = email ?? null
      state.displayName = displayName ?? null
      state.photoURL = photoURL ?? null
    },
    clearAuthUser(state) {
      state.uid = null
      state.email = null
      state.displayName = null
      state.photoURL = null
    },
  },
})

export const { setAuthUser, clearAuthUser } = authSlice.actions
export default authSlice.reducer
