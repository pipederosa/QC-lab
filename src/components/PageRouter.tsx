'use client'
// src/components/PageRouter.tsx
// Renderiza el módulo y página correctos según el estado global.
// Todo es client-side — sin Server Components.

import dynamic from 'next/dynamic'
import { useAppStore } from '@/store/appStore'

// ---- Estabilidades ----
const EstDashboard = dynamic(() => import('./estabilidades/EstDashboard'), { ssr: false })
const EstResults   = dynamic(() => import('./estabilidades/EstResults'),   { ssr: false })
const EstDetail    = dynamic(() => import('./estabilidades/EstDetail'),    { ssr: false })
const EstForm      = dynamic(() => import('./estabilidades/EstForm'),      { ssr: false })
const ActivityLog  = dynamic(() => import('./shared/ActivityLog'),         { ssr: false })

// ---- SCRUM ----
const ScrumDashboard = dynamic(() => import('./scrum/ScrumDashboard'), { ssr: false })
const ScrumResults   = dynamic(() => import('./scrum/ScrumResults'),   { ssr: false })
const ScrumDetail    = dynamic(() => import('./scrum/ScrumDetail'),    { ssr: false })
const ScrumForm      = dynamic(() => import('./scrum/ScrumForm'),      { ssr: false })

// ---- Users ----
const UsersPage = dynamic(() => import('./users/UsersPage'), { ssr: false })

export function PageRouter() {
  const { currentModule, currentPage } = useAppStore()

  if (currentModule === 'est') {
    if (currentPage === 'dashboard') return <EstDashboard />
    if (currentPage === 'results')   return <EstResults />
    if (currentPage === 'full')      return <EstDetail />
    if (currentPage === 'form')      return <EstForm />
    if (currentPage === 'audit')     return <ActivityLog />
  }

  if (currentModule === 'scrum') {
    if (currentPage === 'dashboard') return <ScrumDashboard />
    if (currentPage === 'results')   return <ScrumResults />
    if (currentPage === 'full')      return <ScrumDetail />
    if (currentPage === 'form')      return <ScrumForm />
    if (currentPage === 'audit')     return <ActivityLog />
  }

  if (currentModule === 'users') return <UsersPage />

  return null
}
