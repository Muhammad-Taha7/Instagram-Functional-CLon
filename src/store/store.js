import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import usersReducer from './slices/usersSlice'
import postsReducer from './slices/postsSlice'
import friendReducer from './slices/friendSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    posts: postsReducer,
    friend: friendReducer,
    ui: uiReducer,
  },
})
