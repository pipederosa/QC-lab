'use client'
// src/components/estabilidades/EstDetail.tsx

import React from 'react'
import { useAppStore } from '@/store/appStore'
import { ROLES } from '@/lib/roles'
import { UBICACIONES } from '@/lib/data'
import { Card, CardTitle, DetailField, EstBadge } from '@/components/ui'
import { daysLeft } from '@/lib/utils'
import type { Study } from '@/types'

// ============================================================
// DETAIL SEARCH
// ============================================================
function DetailSearch() {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<Study[]>([])
  const { studies, setCurrentEstDetailId } = useAppStore()
  const ref = React.useRef<HTMLDivElement>(null)

  const handleInput = (q: string) => {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }
    const ql = q.toLowerCase()
    setResults(studies.filter(s =>
      s.prod.toLowerCase().includes(ql) ||
      s.lote.toLowerCase().includes(ql) ||
      s.cod.toLowerCase().includes(ql)
    ).slice(0, 6))
  }

  const select = (id: number) => {
    setCurrentEstDetailId(id)
    setQuery('')
    setResults([])
  }

  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setResults([]) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <input
        value={query}
        onChange={e => handleInput(e.target.value)}
        className="h-8 px-2.5 w-64 text-[12px] font-sans border border-border-2 rounded bg-surface text-gray-700 outline-none focus:border-accent transition-all"
        placeholder="Buscar estudios..."
      />
      {results.length > 0 && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-surface border border-border-2 rounded-lg shadow-xl p-1.5 min-w-[340px]">
          {results.map(s => (
            <button
              key={s.id}
              onClick={() => select(s.id)}
              className="block w-full text-left px-3 py-2 rounded hover:bg-surface-2 transition-colors"
            >
              <div className="text-[13px] font-medium text-gray-800">{s.prod}</div>
              <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                {s.lote} · {s.planta} · <EstBadge estado={s.estado} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// DETAIL CARD SECTION
// ============================================================
interface FieldDef {
  label: string
  key: keyof Study
  type?: 'text' | 'date' | 'select' | 'textarea'
  options?: string[]
}

function DetailSection({
  title, fields, study, editable, onSave,
}: {
  title: string
  fields: FieldDef[]
  study: Study
  editable: boolean
  onSave: (key: keyof Study, val: string) => void
}) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <table className="w-full">
        <tbody>
          {fields.map(f => (
            <DetailField
              key={String(f.key)}
              label={f.label}
              value={String(study[f.key] ?? '')}
              editable={editable}
              type={f.type ?? 'text'}
              options={f.options ?? []}
              onSave={val => onSave(f.key, val)}
            />
          ))}
        </tbody>
      </table>
    </Card>
  )
}

// ============================================================
// MAIN DETAIL COMPONENT
// ============================================================
export default function EstDetail() {
  const {
    currentEstDetailId, studies, currentUser,
    detailEditMode, setDetailEditMode,
    updateStudy, auditLog, setPage,
  } = useAppStore()

  const role = ROLES[currentUser.rol]
  const study = studies.find(s => s.id === currentEstDetailId)

  if (!study) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="mb-4">Ningún estudio seleccionado.</p>
        <button onClick={() => setPage('results')} className="text-accent underline text-[13px]">
          Ir a Resultados
        </button>
      </div>
    )
  }

  const dl = daysLeft(study.limite)
  const limitColor = dl !== null && dl < 0 ? 'text-danger font-semibold' : dl !== null && dl <= 15 ? 'text-warning font-semibold' : ''

  const save = (key: keyof Study, val: string) => updateStudy(study.id, key, val)

  const studyAudit = auditLog.filter(a => a.module === 'est' && a.study === study.id).slice(0, 8)

  const ESTADOS = ['Pendiente', 'En proceso', 'Completo', 'Cancelado']
  const APROBS  = ['—', 'Aprobado', 'Rechazado', 'Pendiente']
  const SN      = ['—', 'Sí', 'No']

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <DetailSearch />
        <div className="flex rounded border border-border-2 overflow-hidden">
          <button
            onClick={() => setDetailEditMode(false)}
            className={['px-3 py-1.5 text-[12px] font-sans transition-all border-r border-border-2',
              !detailEditMode ? 'bg-accent text-white font-medium' : 'bg-surface-2 text-gray-400 hover:bg-border'].join(' ')}
          >
            Solo lectura
          </button>
          <button
            onClick={() => role.canEdit && setDetailEditMode(true)}
            disabled={!role.canEdit}
            className={['px-3 py-1.5 text-[12px] font-sans transition-all',
              detailEditMode ? 'bg-accent text-white font-medium' : 'bg-surface-2 text-gray-400 hover:bg-border',
              !role.canEdit && 'opacity-40 cursor-not-allowed'].join(' ')}
          >
            Modo edición
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <button onClick={() => setPage('results')} className="text-[12px] text-gray-400 border border-border-2 rounded px-2.5 py-1 hover:bg-surface-2 transition-all">
          ← Volver
        </button>
        <span className="text-[16px] font-medium">{study.prod} — Lote {study.lote}</span>
        <EstBadge estado={study.estado} />
        {study.oos && <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium font-mono bg-danger-light text-danger-text">OOS</span>}
        <span className="ml-auto text-[11px] text-gray-400 font-mono">{study.cod} · {study.div}</span>
      </div>

      {detailEditMode && (
        <div className="text-[11px] text-success-text bg-success-light border border-success rounded px-3 py-2 mb-3 font-mono">
          Modo edición activo — los cambios se guardan al salir del campo y se registran en Actividad.
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-3.5">
        <DetailSection title="Identificación" study={study} editable={detailEditMode} onSave={save} fields={[
          { label: 'Código', key: 'cod' },
          { label: 'Producto', key: 'prod' },
          { label: 'Lote', key: 'lote' },
          { label: 'División', key: 'div', type: 'select', options: ['CH', 'PH'] },
          { label: 'Material de empaque', key: 'empaque' },
          { label: 'Planta', key: 'planta', type: 'select', options: ['Planta 1', 'Planta 2'] },
          { label: 'Ubicación física', key: 'ubic', type: 'select', options: UBICACIONES[study.planta] ?? [] },
          { label: 'Motivo del ensayo', key: 'motivo' },
        ]} />

        <DetailSection title="Fechas y condiciones" study={study} editable={detailEditMode} onSave={save} fields={[
          { label: 'Condiciones', key: 'cond' },
          { label: 'Tiempo de estabilidad', key: 'tiempo', type: 'select', options: ['3 meses','6 meses','9 meses','12 meses','18 meses','24 meses','36 meses'] },
          { label: 'Fecha de elaboración', key: 'elab', type: 'date' },
          { label: 'Fecha entrada cámara', key: 'camara', type: 'date' },
          { label: 'Fecha de ingreso', key: 'ingreso', type: 'date' },
          { label: 'F. teórica de análisis', key: 'teorica', type: 'date' },
          { label: 'F. límite de análisis', key: 'limite', type: 'date' },
          { label: 'F. teórica de salida', key: 'salida', type: 'date' },
          { label: 'F. teórica de liberación', key: 'libteor', type: 'date' },
          { label: 'Fecha de liberación', key: 'lib', type: 'date' },
        ]} />

        <DetailSection title="Estado y resultado" study={study} editable={detailEditMode} onSave={save} fields={[
          { label: 'Estado', key: 'estado', type: 'select', options: ESTADOS },
          { label: 'Cumplió', key: 'cumpl', type: 'select', options: SN },
          { label: 'Cumpl. estabilidad', key: 'cumplEst', type: 'select', options: SN },
          { label: 'Aprobación final', key: 'aprob', type: 'select', options: APROBS },
          { label: 'Semana de aprobación', key: 'semana' },
          { label: 'Condiciones de salida', key: 'condsal' },
          { label: 'Status', key: 'status' },
        ]} />

        <DetailSection title="Análisis FQ / Micro" study={study} editable={detailEditMode} onSave={save} fields={[
          { label: 'Analista FQ', key: 'analistFQ' },
          { label: 'F. análisis FQ inicio', key: 'fqi', type: 'date' },
          { label: 'F. análisis FQ fin', key: 'fqf', type: 'date' },
          { label: 'F. validación FQ', key: 'fqv', type: 'date' },
          { label: 'Lleva microbiología', key: 'micro', type: 'select', options: ['Sí', 'No'] },
          { label: 'Analista micro', key: 'analistMicro' },
          { label: 'F. muestreo micro ini', key: 'msi', type: 'date' },
          { label: 'F. muestreo micro fin', key: 'msf', type: 'date' },
        ]} />

        <DetailSection title="Resultados de análisis" study={study} editable={detailEditMode} onSave={save} fields={[
          { label: 'Contenido', key: 'contenido' },
          { label: 'Degradación 1', key: 'deg1' },
          { label: 'Degradación 2', key: 'deg2' },
          { label: 'Degradación 3', key: 'deg3' },
          { label: 'Disolución', key: 'disol' },
        ]} />

        <DetailSection title="Muestreo" study={study} editable={detailEditMode} onSave={save} fields={[
          { label: 'Límite inferior', key: 'limInf' },
          { label: 'Límite superior', key: 'limSup' },
          { label: 'Corredor', key: 'corredor' },
          { label: 'Observaciones', key: 'obs', type: 'textarea' },
        ]} />

        {study.oos && (
          <Card className="col-span-2 border-l-2 border-l-danger rounded-l-none">
            <CardTitle className="text-danger-text">OOS — Fuera de especificación</CardTitle>
            {detailEditMode ? (
              <textarea
                className="w-full px-2 py-1.5 border border-border-2 rounded text-[12px] font-sans text-gray-700 outline-none focus:border-accent min-h-[60px] resize-y transition-all"
                defaultValue={study.oos_obs}
                onBlur={e => save('oos_obs', e.target.value)}
              />
            ) : (
              <p className="text-[13px] text-gray-700 leading-relaxed">{study.oos_obs || '—'}</p>
            )}
          </Card>
        )}

        <Card className="col-span-2">
          <CardTitle>Historial de actividad de este estudio</CardTitle>
          {studyAudit.length > 0 ? (
            <div>
              {studyAudit.map((a, i) => (
                <div key={i} className="flex gap-3 py-2.5 border-b border-border last:border-0 text-[12px]">
                  <div className="font-mono font-medium text-[11px] min-w-[90px] flex-shrink-0">{a.who}</div>
                  <div className="text-gray-500 flex-1 leading-snug">{a.what}</div>
                  <div className="font-mono text-[10px] text-gray-400 min-w-[110px] text-right flex-shrink-0">{a.when}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-gray-400">Sin cambios registrados aún.</p>
          )}
        </Card>
      </div>
    </div>
  )
}
