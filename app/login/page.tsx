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

  async function pingSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    console.log('[DEBUG] SUPABASE_URL', url?.slice(0, 25), '…');
    console.log('[DEBUG] ANON_KEY length', key?.length);
    console.log('[DEBUG] Full URL for health check:', `${url}/auth/v1/health`);
    
    try {
      const r = await fetch(`${url}/auth/v1/health`, { 
        headers: { 
          apikey: key,
          'Content-Type': 'application/json'
        },
        method: 'GET'
      });
      const responseText = await r.text().catch(() => 'Could not read response text');
      console.log('[DEBUG] /auth/v1/health', r.status, responseText);
      
      if (!r.ok) {
        console.error('[DEBUG] Health check failed:', r.status, r.statusText);
      }
    } catch (e) {
      console.error('[DEBUG] health fetch error', e);
      console.error('[DEBUG] Error details:', {
        name: (e as Error)?.name,
        message: (e as Error)?.message,
        stack: (e as Error)?.stack
      });
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Diagnostik: Ping Supabase health endpoint
      await pingSupabase();
      
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
    } catch (e: any) {
      console.error('[LOGIN ERROR]', e);
      console.error('[LOGIN ERROR] Details:', {
        name: e?.name,
        message: e?.message,
        stack: e?.stack,
        cause: e?.cause
      });
      
      const errorMessage = e?.message || e?.toString() || 'An unexpected error occurred. Please try again.';
      setError(`Login-Fehler: ${errorMessage}`);
      alert(`Login-Fehler: ${errorMessage}`);
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
