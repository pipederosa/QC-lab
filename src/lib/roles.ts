// src/lib/roles.ts
import type { RoleKey, RoleConfig, Permission } from '@/types'

export const ROLES: Record<RoleKey, RoleConfig> = {
  viewer: {
    label: 'Viewer',
    color: '#888780',
    canEdit: false,
    canCreate: false,
    canApprove: false,
    canAdmin: false,
    canAudit: false,
    canUsers: false,
  },
  analyst: {
    label: 'Analista',
    color: '#185FA5',
    canEdit: true,
    canCreate: true,
    canApprove: false,
    canAdmin: false,
    canAudit: false,
    canUsers: false,
  },
  supervisor: {
    label: 'Supervisor',
    color: '#854F0B',
    canEdit: true,
    canCreate: true,
    canApprove: true,
    canAdmin: false,
    canAudit: true,
    canUsers: false,
  },
  admin: {
    label: 'Admin',
    color: '#3B6D11',
    canEdit: true,
    canCreate: true,
    canApprove: true,
    canAdmin: true,
    canAudit: true,
    canUsers: true,
  },
}

export const PERMISSIONS_MATRIX: Permission[] = [
  { action: 'Ver Dashboard y resultados',   viewer: true,  analyst: true,  supervisor: true,  admin: true },
  { action: 'Ver detalle de registros',      viewer: true,  analyst: true,  supervisor: true,  admin: true },
  { action: 'Exportar CSV / Excel',          viewer: true,  analyst: true,  supervisor: true,  admin: true },
  { action: 'Editar campos en detalle',      viewer: false, analyst: true,  supervisor: true,  admin: true },
  { action: 'Crear nuevos estudios/lotes',   viewer: false, analyst: true,  supervisor: true,  admin: true },
  { action: 'Aprobar estudios',              viewer: false, analyst: false, supervisor: true,  admin: true },
  { action: 'Ver módulo de Actividad',       viewer: false, analyst: false, supervisor: true,  admin: true },
  { action: 'Gestión de usuarios (Admin)',   viewer: false, analyst: false, supervisor: false, admin: true },
]

// Páginas accesibles por rol para cada módulo
export const EST_NAV: { id: string; label: string; roles: RoleKey[] }[] = [
  { id: 'dashboard', label: 'Dashboard',     roles: ['viewer', 'analyst', 'supervisor', 'admin'] },
  { id: 'results',   label: 'Resultados',    roles: ['viewer', 'analyst', 'supervisor', 'admin'] },
  { id: 'full',      label: 'Detalle',       roles: ['viewer', 'analyst', 'supervisor', 'admin'] },
  { id: 'form',      label: 'Nuevo estudio', roles: ['analyst', 'supervisor', 'admin'] },
  { id: 'audit',     label: 'Actividad',     roles: ['supervisor', 'admin'] },
]

export const SCRUM_NAV: { id: string; label: string; roles: RoleKey[] }[] = [
  { id: 'dashboard', label: 'Dashboard',  roles: ['viewer', 'analyst', 'supervisor', 'admin'] },
  { id: 'results',   label: 'Resultados', roles: ['viewer', 'analyst', 'supervisor', 'admin'] },
  { id: 'full',      label: 'Detalle',    roles: ['viewer', 'analyst', 'supervisor', 'admin'] },
  { id: 'form',      label: 'Nuevo lote', roles: ['analyst', 'supervisor', 'admin'] },
  { id: 'audit',     label: 'Actividad',  roles: ['supervisor', 'admin'] },
]
