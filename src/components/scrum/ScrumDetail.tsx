'use client'
// src/components/scrum/ScrumDetail.tsx

import React from 'react'
import { useAppStore } from '@/store/appStore'
import { ROLES } from '@/lib/roles'
import { Card, CardTitle, DetailField } from '@/components/ui'
import type { ScrumRecord } from '@/types'

// ---- Search ----
function ScrumDetailSearch() {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<ScrumRecord[]>([])
  const { scrumRecords, setCurrentScrumDetailId } = useAppStore()
  const ref = React.useRef<HTMLDivElement>(null)

  const handleInput = (q: string) => {
    setQuery(q)
    if (!q.trim()) { setResults([]); return }
    const ql = q.toLowerCase()
    setResults(
      scrumRecords
        .filter(r => r.cod.toLowerCase().includes(ql) || r.desc.toLowerCase().includes(ql) || r.lote.toLowerCase().includes(ql))
        .slice(0, 6)
    )
  }

  const select = (id: number) => { setCurrentScrumDetailId(id); setQuery(''); setResults([]) }

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
        placeholder="Buscar lotes..."
      />
      {results.length > 0 && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-surface border border-border-2 rounded-lg shadow-xl p-1.5 min-w-[360px]">
          {results.map(r => (
            <button
              key={r.id}
              onClick={() => select(r.id)}
              className="block w-full text-left px-3 py-2 rounded hover:bg-surface-2 transition-colors"
            >
              <div className="text-[13px] font-medium text-gray-800">{r.desc}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{r.lote} · {r.planta} · {r.cod}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---- Field definition helper ----
interface FieldDef { label: string; key: keyof ScrumRecord; type?: 'text' | 'date' | 'select' | 'textarea'; options?: string[] }

function Section({ title, fields, record, editable, onSave }: {
  title: string
  fields: FieldDef[]
  record: ScrumRecord
  editable: boolean
  onSave: (key: keyof ScrumRecord, val: string) => void
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
              value={String(record[f.key] ?? '')}
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

// ---- Main ----
export default function ScrumDetail() {
  const {
    currentScrumDetailId, scrumRecords, currentUser,
    detailEditMode, setDetailEditMode,
    updateScrumRecord, auditLog, setPage,
  } = useAppStore()

  const role = ROLES[currentUser.rol]
  const record = scrumRecords.find(r => r.id === currentScrumDetailId)

  if (!record) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="mb-4">Ningún lote seleccionado.</p>
        <button onClick={() => setPage('results')} className="text-accent underline text-[13px]">
          Ir a Resultados
        </button>
      </div>
    )
  }

  const save = (key: keyof ScrumRecord, val: string) => updateScrumRecord(record.id, key, val)
  const recordAudit = auditLog.filter(a => a.module === 'scrum' && a.study === record.id).slice(0, 8)

  const SN      = ['Sí', 'No']
  const LIB     = ['Cumplió', 'Overdue', 'Pendiente']
  const SF      = ['Pendiente', 'Terminado']
  const STATUS  = ['En análisis', 'Análisis completo', 'Liberado']
  const TIPO    = ['Granel', 'Completo', 'Control Final']

  const libColor =
    record.liberadoATiempo === 'Cumplió' ? 'bg-success-light text-success-text' :
    record.liberadoATiempo === 'Overdue' ? 'bg-danger-light text-danger-text' :
    'bg-accent-light text-accent-text'

  const sfColor = record.statusFinal === 'Terminado' ? 'bg-success-light text-success-text' : 'bg-accent-light text-accent-text'

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <ScrumDetailSearch />
        <div className="flex rounded border border-border-2 overflow-hidden">
          <button
            onClick={() => setDetailEditMode(false)}
            className={[
              'px-3 py-1.5 text-[12px] font-sans transition-all border-r border-border-2',
              !detailEditMode ? 'bg-accent text-white font-medium' : 'bg-surface-2 text-gray-400 hover:bg-border',
            ].join(' ')}
          >
            Solo lectura
          </button>
          <button
            onClick={() => role.canEdit && setDetailEditMode(true)}
            disabled={!role.canEdit}
            className={[
              'px-3 py-1.5 text-[12px] font-sans transition-all',
              detailEditMode ? 'bg-accent text-white font-medium' : 'bg-surface-2 text-gray-400 hover:bg-border',
              !role.canEdit && 'opacity-40 cursor-not-allowed',
            ].join(' ')}
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
        <span className="text-[16px] font-medium">{record.desc} — Lote {record.lote}</span>
        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium font-mono ${sfColor}`}>{record.statusFinal}</span>
        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium font-mono ${libColor}`}>{record.liberadoATiempo}</span>
        {record.prioridad === 'Sí' && (
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium font-mono bg-danger-light text-danger-text">Prioridad</span>
        )}
        <span className="ml-auto text-[11px] text-gray-400 font-mono">{record.cod} · {record.div}</span>
      </div>

      {detailEditMode && (
        <div className="text-[11px] text-success-text bg-success-light border border-success rounded px-3 py-2 mb-3 font-mono">
          Modo edición activo — los cambios se guardan al salir del campo y se registran en Actividad.
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        <Section title="Identificación" record={record} editable={detailEditMode} onSave={save} fields={[
          { label: 'Código',       key: 'cod' },
          { label: 'Planta',       key: 'planta', type: 'select', options: ['Planta 1', 'Planta 2'] },
          { label: 'Descripción',  key: 'desc' },
          { label: 'Lote',         key: 'lote' },
          { label: 'División',     key: 'div',  type: 'select', options: ['PH', 'CH', 'INY'] },
          { label: 'Tipo',         key: 'granelCompControl', type: 'select', options: TIPO },
          { label: 'N° Inspección',key: 'nInspeccion' },
          { label: 'Prioridad',    key: 'prioridad', type: 'select', options: SN },
          { label: 'F. límite prioridad', key: 'fechaLimPrioridad', type: 'date' },
        ]} />

        <Section title="Fechas clave" record={record} editable={detailEditMode} onSave={save} fields={[
          { label: 'Ident. por depósito',   key: 'identDeposito',       type: 'date' },
          { label: 'Límite QC time',         key: 'limiteQC',            type: 'date' },
          { label: 'Ingreso FQ',             key: 'ingresoFQ',           type: 'date' },
          { label: 'SP Micro CONTH/LAL',     key: 'spMicroConthLal',     type: 'date' },
          { label: 'SP Micro esterilidad',   key: 'spMicroEsterilidad',  type: 'date' },
          { label: 'Control higiénico',      key: 'controlHigienico',    type: 'select', options: SN },
          { label: 'F. fin esterilidad',     key: 'fechaFinEsterilidad', type: 'date' },
          { label: 'F. fin micro',           key: 'fechaFinMicro',       type: 'date' },
        ]} />

        <Section title="Análisis FQ" record={record} editable={detailEditMode} onSave={save} fields={[
          { label: 'Analista FQ',           key: 'analistFQ' },
          { label: 'F. inicio análisis',    key: 'fechaInicioAnalisis', type: 'date' },
          { label: 'F. fin análisis',       key: 'fechaFinAnalisis',    type: 'date' },
          { label: 'Validación ficha SAP',  key: 'validacionFichaSAP',  type: 'date' },
          { label: 'Final QC - Aprob. SAP', key: 'finalQCSAP',          type: 'date' },
        ]} />

        <Section title="Resultado final" record={record} editable={detailEditMode} onSave={save} fields={[
          { label: 'Status',            key: 'status',           type: 'select', options: STATUS },
          { label: 'Status final',      key: 'statusFinal',      type: 'select', options: SF },
          { label: '¿Liberado a tiempo?', key: 'liberadoATiempo', type: 'select', options: LIB },
          { label: 'Observaciones',     key: 'obs',              type: 'textarea' },
        ]} />

        {/* Audit */}
        <Card className="col-span-2">
          <CardTitle>Historial de actividad de este lote</CardTitle>
          {recordAudit.length > 0 ? (
            <div>
              {recordAudit.map((a, i) => (
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
