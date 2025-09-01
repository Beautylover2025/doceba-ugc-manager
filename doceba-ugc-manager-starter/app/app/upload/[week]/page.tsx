'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function UploadWeekPage(){
  const { week } = useParams() as { week: string }
  const router = useRouter()
  const [beforeFile, setBeforeFile] = useState<File | null>(null)
  const [afterFile, setAfterFile]   = useState<File | null>(null)
  const [note, setNote]             = useState('')
  const [error, setError]           = useState<string | null>(null)
  const [programId, setProgramId]   = useState<string | null>(null)
  const [userId, setUserId]         = useState<string | null>(null)
  const [uploading, setUploading]   = useState(false)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if(!user){ router.replace('/login'); return }
      setUserId(user.id)
      // Abfrage des Programms, dem der Creator zugeordnet ist
      const { data } = await supabase
        .from('creator_programs')
        .select('program_id, programs(weeks)')
        .eq('creator_id', user.id)
        .maybeSingle()
      if(!data) { setError('Kein Programm zugewiesen.'); return }
      setProgramId(data.program_id)
      const maxWeek = (data as any).programs?.weeks ?? 8
      const w = parseInt(week)
      if(isNaN(w) || w < 1 || w > maxWeek){
        setError(`Ungültige Woche (1..${maxWeek}).`)
      }
    })()
  }, [week, router])

  async function handleUpload(){
    try{
      setError(null)
      if(!programId || !userId) return
      const w = parseInt(week)
      if(!beforeFile && !afterFile) { setError('Bitte mind. ein Bild auswählen.'); return }
      setUploading(true)
      // Speicherpfad
      const base = `creator/${userId}/program/${programId}/week-${w}`
      const updates:any = { program_id: programId, week_index: w, note }

      // Upload "Vorher"
      if(beforeFile){
        const { data, error } = await supabase.storage
          .from('ugc-uploads')
          .upload(`${base}/before-${Date.now()}.jpg`, beforeFile, { upsert: true })
        if(error) throw error
        updates.before_path = data!.path
      }
      // Upload "Nachher"
      if(afterFile){
        const { data, error } = await supabase.storage
          .from('ugc-uploads')
          .upload(`${base}/after-${Date.now()}.jpg`, afterFile, { upsert: true })
        if(error) throw error
        updates.after_path = data!.path
      }

      updates.status = (updates.before_path && updates.after_path) ? 'submitted' : 'partial'
      updates.submitted_at = new Date().toISOString()

      const { error: upErr } = await supabase.from('uploads').upsert({
        creator_id: userId,
        program_id: programId,
        week_index: w,
        ...updates
      })
      if(upErr) throw upErr

      router.replace('/app')
    } catch(e:any){
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-xl font-semibold">Woche {week} – Vorher/Nachher</h1>
      <div className="space-y-3 rounded-2xl border bg-white p-4">
        <div>
          <label className="block text-sm">Vorher-Bild (jpg/png, ≤10 MB)</label>
          <input type="file" accept="image/*" onChange={e=>setBeforeFile(e.target.files?.[0] ?? null)} />
        </div>
        <div>
          <label className="block text-sm">Nachher-Bild (jpg/png, ≤10 MB)</label>
          <input type="file" accept="image/*" onChange={e=>setAfterFile(e.target.files?.[0] ?? null)} />
        </div>
        <textarea className="w-full rounded border p-2" rows={3}
                  placeholder="Kurznotiz" value={note} onChange={e=>setNote(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button onClick={handleUpload}
                className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
                disabled={uploading}>
          {uploading ? 'Lade hoch…' : 'Speichern'}
        </button>
      </div>
    </main>
  )
}
