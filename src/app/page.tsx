'use client'
// src/app/page.tsx
// Entry point — toda la app es client-side.
// Sin Server Components: 'use client' en el root page.

import { Topbar } from '@/components/layout/Topbar'
import { PageRouter } from '@/components/PageRouter'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />
      <main className="flex-1 p-5">
        <PageRouter />
      </main>
    </div>
  )
}
