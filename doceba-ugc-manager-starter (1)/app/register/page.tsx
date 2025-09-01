'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMsg(error.message)
    else {
      setMsg('Registriert. Bitte E-Mail prüfen.')
      router.push('/login')
    }
  }

  return (
    <main className="container">
      <h1 className="header">Registrieren</h1>
      <form onSubmit={onSubmit} className="card" style={{maxWidth:'420px'}}>
        <div style={{display:'grid', gap:'.5rem'}}>
          <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input placeholder="E-Mail" value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder="Passwort" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn" type="submit">Account anlegen</button>
          {msg && <div className="subtle">{msg}</div>}
        </div>
      </form>
      <p style={{marginTop:'.5rem'}}>
        Bereits ein Konto? <a href="/login">Zum Login</a>
      </p>
    </main>
  )
}
