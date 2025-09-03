// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Sign in with email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      // If sign in successful, upsert profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            { 
              id: authData.user.id, 
              email: authData.user.email 
            },
            { 
              onConflict: 'id' 
            }
          )

        if (profileError) {
          console.error('Profile upsert error:', profileError)
          // Don't block login for profile errors, just log them
        }
      }

      // Redirect to home page
      router.replace('/')
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-semibold">Login</h1>

      <form onSubmit={onSubmit} className="space-y-4">
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
          {loading ? 'Einloggen …' : 'Einloggen'}
        </button>
      </form>
    </main>
  )
}
