'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg(error.message)
    else router.push('/app')
  }

  return (
    <main className="container">
      <h1 className="header">Einloggen</h1>
      <form onSubmit={onSubmit} className="card" style={{maxWidth:'420px'}}>
        <div style={{display:'grid', gap:'.5rem'}}>
          <input placeholder="E-Mail" value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder="Passwort" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn" type="submit">Login</button>
          {msg && <div className="subtle">{msg}</div>}
        </div>
      </form>
      <p style={{marginTop:'.5rem'}}>
        Noch kein Konto? <a href="/register">Jetzt registrieren</a>
      </p>
    </main>
  )
}
