'use client'
// src/components/users/UsersPage.tsx

import React, { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { ROLES, PERMISSIONS_MATRIX } from '@/lib/roles'
import { Button, RequiredStar } from '@/components/ui'
import { nowStr } from '@/lib/utils'
import type { RoleKey, PlantaAccess, UserEstado } from '@/types'

interface UserForm {
  nombre: string
  usuario: string
  email: string
  rol: RoleKey | ''
  planta: PlantaAccess
  estado: UserEstado
}

const EMPTY_FORM: UserForm = {
  nombre: '', usuario: '', email: '', rol: '', planta: 'todas', estado: 'activo',
}

const ROLE_COLORS: Record<RoleKey, string> = {
  viewer:     '#888780',
  analyst:    '#185FA5',
  supervisor: '#854F0B',
  admin:      '#3B6D11',
}

export default function UsersPage() {
  const { users, currentUser, addUser, updateUser, toggleUserStatus, addAuditEntry } = useAppStore()

  const [form, setForm]           = useState<UserForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm]   = useState(false)
  const [errors, setErrors]       = useState<Partial<UserForm>>({})

  const set = (k: keyof UserForm, v: string) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e: Partial<UserForm> = {}
    if (!form.nombre.trim()) e.nombre = 'Obligatorio'
    if (!form.usuario.trim()) e.usuario = 'Obligatorio'
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Email inválido'
    if (!form.rol) e.rol = 'Obligatorio' as unknown as RoleKey
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const openNew = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setShowForm(true)
  }

  const openEdit = (id: number) => {
    const u = users.find(x => x.id === id)
    if (!u) return
    setEditingId(id)
    setForm({ nombre: u.nombre, usuario: u.usuario, email: u.email, rol: u.rol, planta: u.planta, estado: u.estado })
    setErrors({})
    setShowForm(true)
  }

  const handleSave = () => {
    if (!validate()) return
    if (editingId) {
      const u = users.find(x => x.id === editingId)
      const oldRol = u?.rol
      updateUser(editingId, {
        nombre: form.nombre, usuario: form.usuario, email: form.email,
        rol: form.rol as RoleKey, planta: form.planta, estado: form.estado,
      })
      addAuditEntry({
        who: currentUser.nombre,
        what: `Editó usuario ${form.usuario}: rol "${oldRol}" → "${form.rol}"`,
        when: nowStr(), field: 'usuario', old: oldRol ?? '', new: form.rol, study: null, module: 'sys',
      })
    } else {
      addUser({ nombre: form.nombre, usuario: form.usuario, email: form.email, rol: form.rol as RoleKey, planta: form.planta, estado: form.estado })
      addAuditEntry({
        who: currentUser.nombre,
        what: `Creó usuario ${form.usuario} con rol ${form.rol}`,
        when: nowStr(), field: 'usuario', old: '', new: form.usuario, study: null, module: 'sys',
      })
    }
    setShowForm(false)
    setEditingId(null)
  }

  const handleToggle = (id: number) => {
    if (id === currentUser.id) { alert('No podés desactivar tu propio usuario.'); return }
    const u = users.find(x => x.id === id)
    const newEstado = u?.estado === 'activo' ? 'inactivo' : 'activo'
    toggleUserStatus(id)
    addAuditEntry({
      who: currentUser.nombre,
      what: `${newEstado === 'activo' ? 'Activó' : 'Desactivó'} usuario ${u?.usuario}`,
      when: nowStr(), field: 'estado', old: u?.estado ?? '', new: newEstado, study: null, module: 'sys',
    })
  }

  const inputCls = (err?: string) => [
    'px-2.5 py-1.5 text-[13px] rounded border font-sans bg-surface text-gray-700 outline-none transition-all w-full',
    err ? 'border-danger' : 'border-border-2 focus:border-accent focus:ring-1 focus:ring-accent/20',
  ].join(' ')

  const Field = ({ label, id, req, err, children }: { label: string; id: string; req?: boolean; err?: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-0.5">
        {label}{req && <RequiredStar />}
      </label>
      {children}
      {err && <span className="text-[11px] text-danger">{err}</span>}
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[16px] font-medium mb-0.5">Gestión de usuarios</h2>
          <p className="text-[12px] text-gray-400">Acceso compartido entre módulos · Solo administradores</p>
        </div>
        <Button variant="primary" onClick={openNew}>+ Nuevo usuario</Button>
      </div>

      {/* User form */}
      {showForm && (
        <div className="bg-surface border border-border rounded-lg p-5 mb-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-4 pb-2 border-b border-border">
            {editingId ? 'Editar usuario' : 'Nuevo usuario'}
          </div>
          <div className="grid grid-cols-2 gap-3 gap-x-5">
            <Field label="Nombre completo" id="uf-nombre" req err={errors.nombre}>
              <input id="uf-nombre" className={inputCls(errors.nombre)} value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Juan Fernández" />
            </Field>
            <Field label="Usuario" id="uf-usuario" req err={errors.usuario}>
              <input id="uf-usuario" className={inputCls(errors.usuario)} value={form.usuario} onChange={e => set('usuario', e.target.value)} placeholder="jfernandez" />
            </Field>
            <Field label="Email" id="uf-email" req err={errors.email}>
              <input id="uf-email" type="email" className={inputCls(errors.email)} value={form.email} onChange={e => set('email', e.target.value)} placeholder="jfernandez@lab.com" />
            </Field>
            <Field label="Rol" id="uf-rol" req err={errors.rol ? String(errors.rol) : undefined}>
              <select id="uf-rol" className={inputCls(errors.rol ? String(errors.rol) : undefined)} value={form.rol} onChange={e => set('rol', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option value="viewer">Viewer — solo lectura</option>
                <option value="analyst">Analista — carga y edición</option>
                <option value="supervisor">Supervisor — aprobación</option>
                <option value="admin">Admin — acceso total</option>
              </select>
            </Field>
            <Field label="Planta habilitada" id="uf-planta">
              <select id="uf-planta" className={inputCls()} value={form.planta} onChange={e => set('planta', e.target.value)}>
                <option value="todas">Todas las plantas</option>
                <option value="Planta 1">Planta 1</option>
                <option value="Planta 2">Planta 2</option>
              </select>
            </Field>
            <Field label="Estado" id="uf-estado">
              <select id="uf-estado" className={inputCls()} value={form.estado} onChange={e => set('estado', e.target.value)}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
            <Button onClick={() => { setShowForm(false); setEditingId(null) }}>Cancelar</Button>
            <Button variant="primary" onClick={handleSave}>Guardar</Button>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="overflow-x-auto border border-border rounded-lg bg-surface mb-4">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-surface-2 border-b border-border">
              {['Nombre','Usuario','Email','Rol','Planta','Estado','Último acceso','Acciones'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const role = ROLES[u.rol]
              const col  = ROLE_COLORS[u.rol]
              const isMe = u.id === currentUser.id
              return (
                <tr
                  key={u.id}
                  className={`border-b border-border last:border-0 hover:bg-surface-2 transition-colors ${isMe ? 'bg-accent-light/40' : ''}`}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-medium font-mono flex-shrink-0"
                        style={{ background: col + '22', color: col }}
                      >
                        {u.initials}
                      </div>
                      <span className="font-medium">{u.nombre}</span>
                      {isMe && (
                        <span className="text-[9px] font-mono text-accent bg-accent-light px-1 rounded">tú</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-gray-500">{u.usuario}</td>
                  <td className="px-3 py-2.5 text-[11px] text-gray-500">{u.email}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium font-mono"
                      style={{ background: col + '22', color: col }}
                    >
                      {role?.label ?? u.rol}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[11px]">{u.planta === 'todas' ? 'Todas' : u.planta}</td>
                  <td className="px-3 py-2.5">
                    <span className={[
                      'inline-block px-2 py-0.5 rounded-full text-[10px] font-medium',
                      u.estado === 'activo' ? 'bg-success-light text-success-text' : 'bg-surface-2 text-gray-400',
                    ].join(' ')}>
                      {u.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[11px] text-gray-400 font-mono">{u.lastLogin}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1.5">
                      <Button size="sm" onClick={() => openEdit(u.id)}>Editar</Button>
                      <Button
                        size="sm"
                        onClick={() => handleToggle(u.id)}
                        className={u.estado === 'activo' ? 'text-danger border-danger/30 hover:bg-danger-light' : 'text-success border-success/30 hover:bg-success-light'}
                      >
                        {u.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Permissions matrix */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-4 pb-2 border-b border-border">
          Matriz de permisos por rol
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-surface-2">
                <th className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-gray-400">Acción</th>
                {(['viewer','analyst','supervisor','admin'] as RoleKey[]).map(r => (
                  <th key={r} className="px-3 py-2.5 text-center text-[10px] font-mono uppercase tracking-wider" style={{ color: ROLE_COLORS[r] }}>
                    {ROLES[r].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS_MATRIX.map((p, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-surface-2' : ''}>
                  <td className="px-3 py-2 text-gray-500">{p.action}</td>
                  {(['viewer','analyst','supervisor','admin'] as RoleKey[]).map(r => (
                    <td key={r} className="px-3 py-2 text-center">
                      {p[r]
                        ? <span className="text-success text-[14px]">✓</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
