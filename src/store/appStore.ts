// src/store/appStore.ts
// Estado global de la app con Zustand.
// React Query maneja server state (datos). Zustand maneja UI state (módulo activo,
// usuario actual, modo edición, filtros, etc.)

import { create } from 'zustand'
import type {
  AppUser, AppModule, Study, ScrumRecord, AuditEntry,
  StudyFilters, ScrumFilters, SortConfig,
} from '@/types'
import { INITIAL_USERS, INITIAL_STUDIES, INITIAL_SCRUM, INITIAL_AUDIT } from '@/lib/data'
import { nowStr } from '@/lib/utils'

// ============================================================
// TYPES
// ============================================================

export type EstPage   = 'dashboard' | 'results' | 'full' | 'form' | 'audit'
export type ScrumPage = 'dashboard' | 'results' | 'full' | 'form' | 'audit'
export type AppPage   = EstPage | ScrumPage | 'users'

interface AppState {
  // ---- Module / page navigation ----
  currentModule: AppModule
  currentPage: AppPage
  setModule: (m: AppModule) => void
  setPage: (p: AppPage) => void

  // ---- Auth / user switcher ----
  currentUser: AppUser
  users: AppUser[]
  switchUser: (id: number) => void
  addUser: (u: Omit<AppUser, 'id' | 'lastLogin' | 'initials'>) => void
  updateUser: (id: number, u: Partial<AppUser>) => void
  toggleUserStatus: (id: number) => void

  // ---- In-memory data (replaces backend in demo) ----
  studies: Study[]
  scrumRecords: ScrumRecord[]
  auditLog: AuditEntry[]
  addStudy: (s: Omit<Study, 'id'>) => void
  updateStudy: (id: number, field: keyof Study, value: unknown) => void
  addScrumRecord: (r: Omit<ScrumRecord, 'id'>) => void
  updateScrumRecord: (id: number, field: keyof ScrumRecord, value: unknown) => void
  addAuditEntry: (e: Omit<AuditEntry, 'id'>) => void

  // ---- Detail state ----
  detailEditMode: boolean
  setDetailEditMode: (v: boolean) => void
  currentEstDetailId: number | null
  setCurrentEstDetailId: (id: number | null) => void
  currentScrumDetailId: number | null
  setCurrentScrumDetailId: (id: number | null) => void

  // ---- Est filters & sort ----
  estFilters: StudyFilters
  setEstFilters: (f: Partial<StudyFilters>) => void
  clearEstFilters: () => void
  estSort: SortConfig
  setEstSort: (col: string) => void
  estDashLoc: 'todas' | 'p1' | 'p2'
  setEstDashLoc: (v: 'todas' | 'p1' | 'p2') => void
  estKpiFilter: string | null
  setEstKpiFilter: (v: string | null) => void

  // ---- Scrum filters & sort ----
  scrumFilters: ScrumFilters
  setScrumFilters: (f: Partial<ScrumFilters>) => void
  clearScrumFilters: () => void
  scrumSort: SortConfig
  setScrumSort: (col: string) => void
  scrumDashLoc: 'todas' | 'p1' | 'p2'
  setScrumDashLoc: (v: 'todas' | 'p1' | 'p2') => void
  scrumDashDiv: 'todas' | 'PH' | 'CH' | 'INY'
  setScrumDashDiv: (v: 'todas' | 'PH' | 'CH' | 'INY') => void
  scrumKpiFilter: string | null
  setScrumKpiFilter: (v: string | null) => void
}

const DEFAULT_EST_FILTERS: StudyFilters = {
  estados: [], plantas: [], ubicaciones: [], divisiones: [], oos: [], search: '',
}

const DEFAULT_SCRUM_FILTERS: ScrumFilters = {
  plantas: [], divisiones: [], statuses: [], liberacion: [], prioridad: [], search: '',
}

// ============================================================
// STORE
// ============================================================

export const useAppStore = create<AppState>((set, get) => ({
  // ---- Navigation ----
  currentModule: 'est',
  currentPage: 'dashboard',
  setModule: (m) => set({ currentModule: m, currentPage: 'dashboard' }),
  setPage: (p) => set({ currentPage: p }),

  // ---- Users ----
  currentUser: INITIAL_USERS[0],
  users: INITIAL_USERS,

  switchUser: (id) => {
    const u = get().users.find(x => x.id === id)
    if (!u) return
    set({ currentUser: u })
    // If on users module and no longer admin, go to est
    if (get().currentModule === 'users' && !['admin'].includes(u.rol)) {
      set({ currentModule: 'est', currentPage: 'dashboard' })
    }
  },

  addUser: (u) => {
    const initials = u.nombre.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    const id = Math.max(...get().users.map(x => x.id), 0) + 1
    const newUser: AppUser = { ...u, id, lastLogin: 'Nunca', initials }
    set(s => ({ users: [...s.users, newUser] }))
  },

  updateUser: (id, partial) => {
    set(s => ({ users: s.users.map(u => u.id === id ? { ...u, ...partial } : u) }))
  },

  toggleUserStatus: (id) => {
    if (id === get().currentUser.id) return
    set(s => ({
      users: s.users.map(u =>
        u.id === id ? { ...u, estado: u.estado === 'activo' ? 'inactivo' : 'activo' } : u
      ),
    }))
  },

  // ---- Data ----
  studies: INITIAL_STUDIES,
  scrumRecords: INITIAL_SCRUM,
  auditLog: INITIAL_AUDIT,

  addStudy: (s) => {
    const id = Math.max(...get().studies.map(x => x.id), 0) + 1
    set(st => ({ studies: [...st.studies, { ...s, id }] }))
  },

  updateStudy: (id, field, value) => {
    const study = get().studies.find(s => s.id === id)
    if (!study) return
    const oldVal = String(study[field] ?? '')
    const newVal = String(value ?? '')
    if (oldVal === newVal) return
    set(s => ({ studies: s.studies.map(st => st.id === id ? { ...st, [field]: value } : st) }))
    get().addAuditEntry({
      who: get().currentUser.nombre,
      what: `Editó "${field}" en ${study.prod} (${study.lote}): "${oldVal || '—'}" → "${newVal || '—'}"`,
      when: nowStr(), field: String(field), old: oldVal, new: newVal, study: id, module: 'est',
    })
  },

  addScrumRecord: (r) => {
    const id = Math.max(...get().scrumRecords.map(x => x.id), 0) + 1
    set(s => ({ scrumRecords: [...s.scrumRecords, { ...r, id }] }))
  },

  updateScrumRecord: (id, field, value) => {
    const rec = get().scrumRecords.find(r => r.id === id)
    if (!rec) return
    const oldVal = String(rec[field] ?? '')
    const newVal = String(value ?? '')
    if (oldVal === newVal) return
    set(s => ({ scrumRecords: s.scrumRecords.map(r => r.id === id ? { ...r, [field]: value } : r) }))
    get().addAuditEntry({
      who: get().currentUser.nombre,
      what: `SCRUM: Editó "${field}" en ${rec.desc} (${rec.lote}): "${oldVal || '—'}" → "${newVal || '—'}"`,
      when: nowStr(), field: String(field), old: oldVal, new: newVal, study: id, module: 'scrum',
    })
  },

  addAuditEntry: (e) => {
    set(s => ({ auditLog: [{ ...e, id: Date.now() }, ...s.auditLog] }))
  },

  // ---- Detail ----
  detailEditMode: false,
  setDetailEditMode: (v) => set({ detailEditMode: v }),
  currentEstDetailId: null,
  setCurrentEstDetailId: (id) => set({ currentEstDetailId: id }),
  currentScrumDetailId: null,
  setCurrentScrumDetailId: (id) => set({ currentScrumDetailId: id }),

  // ---- Est ----
  estFilters: DEFAULT_EST_FILTERS,
  setEstFilters: (f) => set(s => ({ estFilters: { ...s.estFilters, ...f } })),
  clearEstFilters: () => set({ estFilters: DEFAULT_EST_FILTERS }),
  estSort: { col: null, dir: 1 },
  setEstSort: (col) => set(s => ({
    estSort: { col, dir: s.estSort.col === col ? (s.estSort.dir * -1 as 1 | -1) : 1 },
  })),
  estDashLoc: 'todas',
  setEstDashLoc: (v) => set({ estDashLoc: v }),
  estKpiFilter: null,
  setEstKpiFilter: (v) => set({ estKpiFilter: v }),

  // ---- Scrum ----
  scrumFilters: DEFAULT_SCRUM_FILTERS,
  setScrumFilters: (f) => set(s => ({ scrumFilters: { ...s.scrumFilters, ...f } })),
  clearScrumFilters: () => set({ scrumFilters: DEFAULT_SCRUM_FILTERS }),
  scrumSort: { col: null, dir: 1 },
  setScrumSort: (col) => set(s => ({
    scrumSort: { col, dir: s.scrumSort.col === col ? (s.scrumSort.dir * -1 as 1 | -1) : 1 },
  })),
  scrumDashLoc: 'todas',
  setScrumDashLoc: (v) => set({ scrumDashLoc: v }),
  scrumDashDiv: 'todas',
  setScrumDashDiv: (v) => set({ scrumDashDiv: v }),
  scrumKpiFilter: null,
  setScrumKpiFilter: (v) => set({ scrumKpiFilter: v }),
}))
