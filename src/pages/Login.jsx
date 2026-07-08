import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login(){
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAuth(e){
    e.preventDefault()
    setLoading(true)
    setMsg('')

    if(mode === 'signup'){
      const { error } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if(error) setMsg(error.message)
      else setMsg('Account created. Check your email to confirm if needed.')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if(error) setMsg(error.message)
    else {
      setMsg('Signed in successfully')
      navigate('/')
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 py-2">
      <div className="card space-y-3">
        <div className="icon-pill">🔐</div>
        <div>
          <h2 className="text-xl font-semibold">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="text-sm text-slate-500">Fast and secure access for your room management app.</p>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="flex rounded-2xl bg-slate-100 p-1">
          <button type="button" className={`flex-1 ${mode === 'login' ? '' : 'secondary'}`} onClick={() => setMode('login')}>Log in</button>
          <button type="button" className={`flex-1 ${mode === 'signup' ? '' : 'secondary'}`} onClick={() => setMode('signup')}>Sign up</button>
        </div>
        <form onSubmit={handleAuth} className="space-y-3">
          <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="w-full" disabled={loading}>{loading ? (mode === 'signup' ? 'Creating account...' : 'Signing in...') : (mode === 'signup' ? 'Create account' : 'Sign in')}</button>
        </form>
        <p className="text-sm text-slate-600">{msg}</p>
      </div>
    </div>
  )
}
