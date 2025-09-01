import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Doceba UGC Manager',
  description: 'MVP Verwaltung'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
