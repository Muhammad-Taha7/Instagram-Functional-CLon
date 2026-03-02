import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { onAuthStateChanged, updateProfile } from 'firebase/auth'
import { useDispatch } from 'react-redux'
import { AuthModel } from './Auth/AuthModel'
import { auth } from './Auth/Firebase'
import { InstagramPage } from './InstagramPage'
import { setAuthUser, clearAuthUser } from './store/slices/authSlice'

const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

const PublicRoute = ({ user, children }) => {
  if (user) {
    return <Navigate to="/instagram" replace />
  }

  return children
}

export const App = () => {
  const dispatch = useDispatch()
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const defaultPhoto = `https://i.pravatar.cc/150?u=${encodeURIComponent(firebaseUser.email || firebaseUser.uid)}`
        if (!firebaseUser.photoURL) {
          updateProfile(firebaseUser, { photoURL: defaultPhoto }).catch(() => {})
        }
        dispatch(setAuthUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL || defaultPhoto,
        }))
      } else {
        dispatch(clearAuthUser())
      }
      setCheckingAuth(false)
    })

    return unsubscribe
  }, [dispatch])

  if (checkingAuth) {
    return (
      <main className="grid min-h-screen place-items-center bg-zinc-100 text-slate-700">
        Checking account...
      </main>
    )
  }

  return (
    <main>
      <Routes>
        <Route
          path="/auth"
          element={
            <PublicRoute user={user}>
              <AuthModel />
            </PublicRoute>
          }
        />
        <Route
          path="/instagram"
          element={
            <ProtectedRoute user={user}>
              <InstagramPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={user ? '/instagram' : '/auth'} replace />} />
      </Routes>
    </main>
  )
}
