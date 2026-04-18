// src/types/index.ts
// Tipos compartidos para LabQC — Estabilidades + SCRUM

// ============================================================
// ROLES & PERMISSIONS
// ============================================================

export type RoleKey = 'viewer' | 'analyst' | 'supervisor' | 'admin'

export interface RoleConfig {
  label: string
  color: string
  canEdit: boolean
  canCreate: boolean
  canApprove: boolean
  canAdmin: boolean
  canAudit: boolean
  canUsers: boolean
}

export interface Permission {
  action: string
  viewer: boolean
  analyst: boolean
  supervisor: boolean
  admin: boolean
}

// ============================================================
// USERS
// ============================================================

export type PlantaAccess = 'todas' | 'Planta 1' | 'Planta 2'
export type UserEstado = 'activo' | 'inactivo'

export interface AppUser {
  id: number
  nombre: string
  usuario: string
  email: string
  rol: RoleKey
  planta: PlantaAccess
  estado: UserEstado
  lastLogin: string
  initials: string
}

// ============================================================
// ESTABILIDADES
// ============================================================

export type EstadoEstudio =
  | 'Pendiente'
  | 'En proceso'
  | 'Completo'
  | 'Cancelado'

export type Division = 'CH' | 'PH'
export type Aprobacion = '—' | 'Aprobado' | 'Rechazado' | 'Pendiente'
export type SiNo = 'Sí' | 'No' | ''

export interface Study {
  id: number
  cod: string
  prod: string
  lote: string
  cond: string
  tiempo: string
  ingreso: string       // dd/mm/yyyy
  teorica: string
  limite: string
  estado: EstadoEstudio
  oos: boolean
  oos_obs: string
  planta: 'Planta 1' | 'Planta 2'
  ubic: string
  div: Division
  analistFQ: string
  analistMicro: string
  micro: SiNo
  aprob: Aprobacion
  cumpl: SiNo
  elab: string
  camara: string
  fqi: string
  fqf: string
  fqv: string
  msi: string
  msf: string
  contenido: string
  deg1: string
  deg2: string
  deg3: string
  disol: string
  condsal: string
  semana: string
  status: string
  limInf: string
  limSup: string
  corredor: string
  cumplEst: SiNo
  salida: string
  libteor: string
  lib: string
  motivo: string
  empaque: string
  obs: string
}

export interface StudyFilters {
  estados: EstadoEstudio[]
  plantas: string[]
  ubicaciones: string[]
  divisiones: Division[]
  oos: ('si' | 'no')[]
  search: string
}

// ============================================================
// SCRUM
// ============================================================

export type ScrumStatus = 'En análisis' | 'Análisis completo' | 'Liberado'
export type StatusFinal = 'Pendiente' | 'Terminado'
export type LiberadoATiempo = 'Cumplió' | 'Overdue' | 'Pendiente'
export type TipoLote = 'Granel' | 'Completo' | 'Control Final'
export type DivisionScrum = 'PH' | 'CH' | 'INY'

export interface ScrumRecord {
  id: number
  cod: string
  planta: 'Planta 1' | 'Planta 2'
  desc: string
  lote: string
  div: DivisionScrum
  nInspeccion: string
  prioridad: SiNo
  fechaLimPrioridad: string
  identDeposito: string
  limiteQC: string
  ingresoFQ: string
  spMicroConthLal: string
  spMicroEsterilidad: string
  controlHigienico: SiNo
  fechaFinEsterilidad: string
  fechaFinMicro: string
  analistFQ: string
  fechaInicioAnalisis: string
  fechaFinAnalisis: string
  validacionFichaSAP: string
  finalQCSAP: string
  obs: string
  status: ScrumStatus
  statusFinal: StatusFinal
  liberadoATiempo: LiberadoATiempo
  granelCompControl: TipoLote
}

export interface ScrumFilters {
  plantas: string[]
  divisiones: DivisionScrum[]
  statuses: ScrumStatus[]
  liberacion: LiberadoATiempo[]
  prioridad: SiNo[]
  search: string
}

// ============================================================
// AUDIT
// ============================================================

export type AuditModule = 'est' | 'scrum' | 'sys'

export interface AuditEntry {
  id?: number
  who: string
  what: string
  when: string
  field: string
  old: string
  new: string
  study: number | null
  module: AuditModule
}

// ============================================================
// APP STATE
// ============================================================

export type AppModule = 'est' | 'scrum' | 'users'
export type EstPage = 'dashboard' | 'results' | 'full' | 'form' | 'audit'
export type ScrumPage = 'dashboard' | 'results' | 'full' | 'form' | 'audit'
export type AppPage = EstPage | ScrumPage | 'users'

export interface SortConfig {
  col: string | null
  dir: 1 | -1
}

// ============================================================
// QUARTERS
// ============================================================

export interface QuarterData {
  q: string
  pct: number
}
