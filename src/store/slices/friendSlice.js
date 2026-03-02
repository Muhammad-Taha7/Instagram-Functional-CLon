import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ref, remove, update } from 'firebase/database'
import { db } from '../../Auth/Firebase'

/* ── Async Thunks ─────────────────────────────────────── */

export const sendFriendRequest = createAsyncThunk(
  'friend/sendRequest',
  async ({ targetId }, { getState }) => {
    const { auth } = getState()
    const { uid, displayName, photoURL } = auth
    if (!uid || uid === targetId) return
    const updates = {}
    updates[`friendRequests/${targetId}/${uid}`] = {
      from: uid,
      to: targetId,
      fromName: displayName || 'User',
      fromPhoto: photoURL || '',
      status: 'pending',
      createdAt: Date.now(),
    }
    updates[`sentRequests/${uid}/${targetId}`] = true
    await update(ref(db), updates)
  }
)

export const cancelFriendRequest = createAsyncThunk(
  'friend/cancelRequest',
  async ({ targetId }, { getState }) => {
    const { auth } = getState()
    const updates = {}
    updates[`friendRequests/${targetId}/${auth.uid}`] = null
    updates[`sentRequests/${auth.uid}/${targetId}`] = null
    await update(ref(db), updates)
  }
)

export const acceptFriendRequest = createAsyncThunk(
  'friend/acceptRequest',
  async ({ senderId }, { getState }) => {
    const { auth } = getState()
    const uid = auth.uid
    const updates = {}
    updates[`friends/${uid}/${senderId}`] = true
    updates[`friends/${senderId}/${uid}`] = true
    updates[`friendRequests/${uid}/${senderId}`] = null
    updates[`sentRequests/${senderId}/${uid}`] = null
    await update(ref(db), updates)
  }
)

export const rejectFriendRequest = createAsyncThunk(
  'friend/rejectRequest',
  async ({ senderId }, { getState }) => {
    const { auth } = getState()
    const updates = {}
    updates[`friendRequests/${auth.uid}/${senderId}`] = null
    updates[`sentRequests/${senderId}/${auth.uid}`] = null
    await update(ref(db), updates)
  }
)

export const unfriend = createAsyncThunk(
  'friend/unfriend',
  async ({ targetId }, { getState }) => {
    const { auth } = getState()
    const updates = {}
    updates[`friends/${auth.uid}/${targetId}`] = null
    updates[`friends/${targetId}/${auth.uid}`] = null
    await update(ref(db), updates)
  }
)

/* ── Slice ─────────────────────────────────────────────── */

const friendSlice = createSlice({
  name: 'friend',
  initialState: {
    friends: {},
    incomingRequests: {},
    sentRequests: {},
  },
  reducers: {
    setFriends(state, action) {
      state.friends = action.payload ?? {}
    },
    setIncomingRequests(state, action) {
      state.incomingRequests = action.payload ?? {}
    },
    setSentRequests(state, action) {
      state.sentRequests = action.payload ?? {}
    },
  },
})

export const { setFriends, setIncomingRequests, setSentRequests } = friendSlice.actions
export default friendSlice.reducer
