'use client'
// src/components/layout/Topbar.tsx

import React from 'react'
import { useAppStore } from '@/store/appStore'
import { ROLES, EST_NAV, SCRUM_NAV } from '@/lib/roles'
import { cn } from '@/lib/utils'
import type { AppModule, AppPage } from '@/types'

// ============================================================
// MODULE SWITCHER
// ============================================================

const MODULE_CONFIG = {
  est:   { icon: '◈', label: 'Estabilidades', sub: 'Control de estudios GxP' },
  scrum: { icon: '◉', label: 'SCRUM',          sub: 'Control de liberación de lotes' },
  users: { icon: '◎', label: 'Usuarios',        sub: 'Gestión de accesos y roles' },
} as const

function ModuleSwitcher() {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const { currentModule, setModule, currentUser } = useAppStore()
  const role = ROLES[currentUser.rol]

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = MODULE_CONFIG[currentModule]

  const handleSelect = (m: AppModule) => {
    if (m === 'users' && !role.canAdmin) return
    setModule(m)
    setOpen(false)
  }

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 border-[1.5px] border-accent rounded-lg px-3 py-1.5 min-w-[180px] hover:bg-accent-light transition-all"
      >
        <span className="text-accent text-sm">{current.icon}</span>
        <span className="text-[13px] font-medium text-accent-text flex-1">{current.label}</span>
        <span className="text-[10px] text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 bg-surface border border-border-2 rounded-lg shadow-xl p-1.5 min-w-[240px]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 px-2 py-1.5 border-b border-border mb-1">
            Módulos del sistema
          </div>
          {(['est', 'scrum'] as AppModule[]).map(m => (
            <button
              key={m}
              onClick={() => handleSelect(m)}
              className={cn(
                'flex items-center gap-3 w-full px-2.5 py-2 rounded transition-colors text-left',
                currentModule === m ? 'bg-accent-light' : 'hover:bg-surface-2'
              )}
            >
              <span className="text-accent text-base w-5 text-center">{MODULE_CONFIG[m].icon}</span>
              <div>
                <div className="text-[13px] font-medium text-gray-800">{MODULE_CONFIG[m].label}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{MODULE_CONFIG[m].sub}</div>
              </div>
            </button>
          ))}
          {role.canAdmin && (
            <>
              <div className="h-px bg-border my-1" />
              <button
                onClick={() => handleSelect('users')}
                className={cn(
                  'flex items-center gap-3 w-full px-2.5 py-2 rounded transition-colors text-left',
                  currentModule === 'users' ? 'bg-accent-light' : 'hover:bg-surface-2'
                )}
              >
                <span className="text-accent text-base w-5 text-center">{MODULE_CONFIG.users.icon}</span>
                <div>
                  <div className="text-[13px] font-medium text-gray-800">{MODULE_CONFIG.users.label}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{MODULE_CONFIG.users.sub}</div>
                </div>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================
// NAV
// ============================================================

function Nav() {
  const { currentModule, currentPage, setPage, currentUser } = useAppStore()
  const role = currentUser.rol
  if (currentModule === 'users') return null

  const pages = currentModule === 'est' ? EST_NAV : SCRUM_NAV
  const visible = pages.filter(p => p.roles.includes(role))

  return (
    <nav className="flex gap-0.5 flex-1">
      {visible.map(p => (
        <button
          key={p.id}
          onClick={() => setPage(p.id as AppPage)}
          className={cn(
            'px-3.5 py-1.5 rounded text-[13px] font-sans transition-all whitespace-nowrap',
            currentPage === p.id
              ? 'bg-accent-light text-accent-text font-medium'
              : 'text-gray-400 hover:bg-surface-2 hover:text-gray-700'
          )}
        >
          {p.label}
        </button>
      ))}
    </nav>
  )
}

// ============================================================
// USER SWITCHER
// ============================================================

function UserSwitcher() {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  const { currentUser, users, switchUser } = useAppStore()
  const role = ROLES[currentUser.rol]

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 border border-border-2 rounded-lg px-2.5 py-1 hover:bg-surface-2 hover:border-accent transition-all"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium font-mono"
          style={{ background: role.color + '22', color: role.color }}
        >
          {currentUser.initials}
        </div>
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[12px] font-medium text-gray-800">{currentUser.nombre}</span>
          <span
            className="text-[10px] font-mono font-medium px-1 rounded"
            style={{ background: role.color + '22', color: role.color }}
          >
            {role.label}
          </span>
        </div>
        <span className="text-[10px] text-gray-400 ml-1">▾</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 z-50 bg-surface border border-border-2 rounded-lg shadow-xl p-1.5 min-w-[220px]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 px-2 py-1.5 border-b border-border mb-1">
            Cambiar usuario (demo)
          </div>
          {users.filter(u => u.estado === 'activo').map(u => {
            const r = ROLES[u.rol]
            const isMe = u.id === currentUser.id
            return (
              <button
                key={u.id}
                onClick={() => { switchUser(u.id); setOpen(false) }}
                className={cn(
                  'flex items-center gap-2.5 w-full px-2.5 py-2 rounded transition-colors text-left',
                  isMe ? 'bg-accent-light' : 'hover:bg-surface-2'
                )}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium font-mono flex-shrink-0"
                  style={{ background: r.color + '22', color: r.color }}
                >
                  {u.initials}
                </div>
                <div className="flex flex-col">
                  <div className="text-[12px] font-medium text-gray-800 flex items-center gap-1">
                    {u.nombre}
                    {isMe && <span className="text-[9px] bg-accent-light text-accent-text px-1 rounded font-mono">tú</span>}
                  </div>
                  <div className="text-[10px] font-mono font-medium" style={{ color: r.color }}>
                    {r.label}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================================
// TOPBAR (exported)
// ============================================================

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 h-[52px] bg-surface border-b border-border flex items-center px-4 gap-3">
      <ModuleSwitcher />
      <Nav />
      <UserSwitcher />
    </header>
  )
}
