import React, { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth, googleProvider } from './Firebase'

export const AuthModel = () => {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const resetFeedback = () => {
    setError('')
    setMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    resetFeedback()
    setLoading(true)

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        if (name.trim()) {
          await updateProfile(userCredential.user, { displayName: name.trim() })
        }
        await signOut(auth)
        setMessage('Sign up successful. Please log in to continue.')
        setMode('login')
        setPassword('')
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        setMessage('Login successful.')
        navigate('/instagram', { replace: true })
      }
    } catch (firebaseError) {
      setError(firebaseError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    resetFeedback()
    setLoading(true)

    try {
      await signInWithPopup(auth, googleProvider)
      setMessage('Google login successful.')
      navigate('/instagram', { replace: true })
    } catch (firebaseError) {
      setError(firebaseError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen  bg-white lg:grid lg:grid-cols-[1.2fr_1fr] lg:bg-zinc-100">
      <div className="hidden flex-col items-center px-6 py-8 text-center  lg:flex lg:items-start lg:px-14 lg:py-10 lg:text-left">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
          alt="Instagram"
          className="mb-8 w-14 lg:mb-12 lg:w-16"
        />
        <h1 className="max-w-140 text-[clamp(1.8rem,4vw,3.6rem)] font-bold leading-tight text-slate-900">
          See everyday moments from your <span className="bg-linear-to-r from-orange-500 to-fuchsia-600 bg-clip-text text-transparent">close friends.</span>
        </h1>
        <div className="img flex items-center justify-center ">
            <img className='h-120' src="https://static.cdninstagram.com/rsrc.php/v4/yF/r/reN9rvYdLTB.png" alt="" />
        </div>
      </div>

      <div className="grid min-h-screen place-items-center bg-white px-5 py-8 sm:px-6 lg:px-6 lg:py-6">
        <div className="w-full max-w-105">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
            alt="Instagram"
            className="mx-auto mb-5 w-14 lg:hidden"
          />
          <h2 className="text-3xl text-center font-semibold text-slate-900">{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="mb-7 mt-2.5 text-center text-slate-600">{mode === 'signup' ? 'Create your account first, then log in anytime.' : 'Sign in using your email and password.'}</p>

          <form onSubmit={handleSubmit} className="grid gap-3">
            {mode === 'signup' && (
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="rounded-xl border border-gray-300 px-3.5 py-3 text-base outline-none transition focus:border-pink-700"
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="rounded-xl border border-gray-300 px-3.5 py-3 text-base outline-none transition focus:border-pink-700"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="rounded-xl border border-gray-300 px-3.5 py-3 text-base outline-none transition focus:border-pink-700"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-xl bg-linear-to-r from-orange-500 to-fuchsia-600 px-4 py-3 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Please wait...' : mode === 'signup' ? 'Sign up' : 'Login'}
            </button>
          </form>

          <button
            className="mt-3.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            Continue with Google
          </button>

          <p className="mt-4 text-[0.95rem] text-center text-slate-600">
            {mode === 'signup' ? 'Already have an account?' : 'No account yet?'}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signup' ? 'login' : 'signup')
                resetFeedback()
              }}
              className="ml-2  border-none bg-transparent font-bold text-fuchsia-600"
            >
              {mode === 'signup' ? 'Login' : 'Sign up'}
            </button>
          </p>

          {message && <p className="mt-3.5 text-center text-sm text-emerald-700">{message}</p>}
          {error && <p className="mt-3.5  text-center text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </section>
  )
}
