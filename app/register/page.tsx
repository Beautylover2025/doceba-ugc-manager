'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getSiteOrigin } from '@/lib/site'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const origin = getSiteOrigin()

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${origin}/`
        }
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      router.replace('/')
    } catch (e: any) {
      const msg = e?.message || e?.toString() || 'Unbekannter Fehler'
      setError(`Registrierungs-Fehler: ${msg}`)
      alert(`Registrierungs-Fehler: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-semibold">Registrieren</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-gray-700">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border p-2"
            placeholder="Max Mustermann"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-700">E-Mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border p-2"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-700">Passwort</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border p-2"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Registrieren …' : 'Registrieren'}
        </button>
      </form>

      <p className="mt-2 text-sm text-gray-700">
        Bereits ein Konto?{' '}
        <a className="text-blue-600 underline-offset-2 hover:underline" href="/login">Zum Login</a>
      </p>
    </main>
  )
}
