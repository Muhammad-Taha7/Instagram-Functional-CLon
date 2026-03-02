import { createSlice } from '@reduxjs/toolkit'

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    all: {},
  },
  reducers: {
    setUsers(state, action) {
      state.all = action.payload ?? {}
    },
  },
})

export const { setUsers } = usersSlice.actions
export default usersSlice.reducer
