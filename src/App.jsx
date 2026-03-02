import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { AuthModel } from './Auth/AuthModel'
import { auth } from './Auth/Firebase'
import { InstagramPage } from './InstagramPage'

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
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setCheckingAuth(false)
    })

    return unsubscribe
  }, [])

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
              <InstagramPage user={user} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={user ? '/instagram' : '/auth'} replace />} />
      </Routes>
    </main>
  )
}
