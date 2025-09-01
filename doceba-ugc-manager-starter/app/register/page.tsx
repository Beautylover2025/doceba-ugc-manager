'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    // Nutzer anlegen (Rolle 'creator')
    const user = data.user
    if (user) {
      await supabase.from('profiles').insert({
        id: user.id,
        name,
        email,
        role: 'creator'
      })
      setLoading(false)
      router.replace('/app')
    } else {
      setLoading(false)
      router.replace('/login')
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-xl font-semibold">Registrieren</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded border p-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full rounded border p-2"
          placeholder="E-Mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded border p-2"
          placeholder="Passwort"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          className="w-full rounded bg-black p-2 text-white disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Bitte warten …' : 'Account anlegen'}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Bereits ein Konto?{' '}
        <a className="text-blue-600 underline" href="/login">Zum Login</a>
      </p>
    </main>
  )
}
