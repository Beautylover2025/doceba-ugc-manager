# Doceba UGC Manager – Starter (Next.js + Supabase)

Minimal lauffähiges Grundgerüst mit:
- Supabase Auth (auth-helpers), Middleware für Session-Refresh
- Admin-Dashboard (Server-Komponente) mit Thumbnails & Download-Proxy (`/api/image`)
- Einfache Login/Registrierung
- Platzhalter-Uploadseite

## Erwartete Tabellen / Storage

- Tabelle `profiles`: Spalten `id (uuid, pk, = auth.user().id)`, `role text` (`admin`/`creator`), `name text`, `email text`
- Tabelle `uploads`: Spalten `id uuid`, `creator_id uuid`, `program_id text`, `week_index int`, `status text`, `created_at timestamptz`, `before_path text`, `after_path text`
- Storage-Bucket `ugc-uploads`, Objekte werden unter dem in `before_path`/`after_path` angegebenen **Pfad** gespeichert.

## Env Variablen (Vercel)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Start

```bash
npm i
npm run dev
```
