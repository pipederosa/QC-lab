'use client'
// src/components/scrum/ScrumResults.tsx

import React from 'react'
import { useAppStore } from '@/store/appStore'
import { ROLES } from '@/lib/roles'
import {
  MultiFilter, FilterChip, Button, SortableTh,
} from '@/components/ui'
import {
  daysLeft, compareVal, csvDownload, xlsxDownload, dateStamp,
} from '@/lib/utils'
import type { ScrumRecord, DivisionScrum, ScrumStatus, LiberadoATiempo } from '@/types'

const STATUS_OPTIONS: ScrumStatus[] = ['En análisis', 'Análisis completo', 'Liberado']
const DIV_OPTIONS: DivisionScrum[]  = ['PH', 'CH', 'INY']
const LIB_OPTIONS: LiberadoATiempo[] = ['Cumplió', 'Overdue', 'Pendiente']

function LiberadoBadge({ value }: { value: LiberadoATiempo }) {
  const cls =
    value === 'Cumplió' ? 'bg-success-light text-success-text' :
    value === 'Overdue' ? 'bg-danger-light text-danger-text' :
    'bg-accent-light text-accent-text'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium font-mono ${cls}`}>
      {value}
    </span>
  )
}

function StatusFinalBadge({ value }: { value: string }) {
  const cls = value === 'Terminado'
    ? 'bg-success-light text-success-text'
    : 'bg-accent-light text-accent-text'
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium font-mono ${cls}`}>{value}</span>
}

export default function ScrumResults() {
  const {
    scrumRecords, scrumFilters, setScrumFilters, clearScrumFilters,
    scrumSort, setScrumSort, scrumKpiFilter, setScrumKpiFilter,
    currentUser, setPage, setCurrentScrumDetailId,
  } = useAppStore()

  const role = ROLES[currentUser.rol]
  const [exportOpen, setExportOpen] = React.useState(false)
  const exportRef = React.useRef<HTMLDivElement>(null)

  // Apply KPI filter on mount
  React.useEffect(() => {
    if (!scrumKpiFilter) return
    clearScrumFilters()
    if (scrumKpiFilter === 'overdue')    setScrumFilters({ liberacion: ['Overdue'] })
    if (scrumKpiFilter === 'ingresados') { /* handled in filter fn */ }
    setScrumKpiFilter(null)
  }, []) // eslint-disable-line

  React.useEffect(() => {
    const h = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = React.useMemo(() => {
    let data = [...scrumRecords]
    if (scrumFilters.plantas.length)    data = data.filter(r => scrumFilters.plantas.includes(r.planta))
    if (scrumFilters.divisiones.length) data = data.filter(r => scrumFilters.divisiones.includes(r.div))
    if (scrumFilters.statuses.length)   data = data.filter(r => scrumFilters.statuses.includes(r.status))
    if (scrumFilters.liberacion.length) data = data.filter(r => scrumFilters.liberacion.includes(r.liberadoATiempo))
    if (scrumFilters.prioridad.length)  data = data.filter(r => scrumFilters.prioridad.includes(r.prioridad))
    if (scrumFilters.search) {
      const q = scrumFilters.search.toLowerCase()
      data = data.filter(r =>
        r.cod.toLowerCase().includes(q) ||
        r.desc.toLowerCase().includes(q) ||
        r.lote.toLowerCase().includes(q)
      )
    }
    if (scrumSort.col) {
      data = data.slice().sort((a, b) =>
        compareVal(a, b, scrumSort.col!) * scrumSort.dir
      )
    }
    return data
  }, [scrumRecords, scrumFilters, scrumSort])

  const showDetail = (id: number) => {
    setCurrentScrumDetailId(id)
    setPage('full')
  }

  // Export helpers
  const HEADERS = [
    'Código','Planta','Descripción','Lote','División',
    'Ident. depósito','Límite QC','Ingreso FQ','Status',
    'N° Inspección','Prioridad','F. límite prioridad',
    'SP Micro CONTH/LAL','SP Micro Esterilidad','Control Higiénico',
    'F. fin esterilidad','F. fin micro','Analista FQ',
    'F. inicio análisis','F. fin análisis',
    'Validación SAP','Final QC SAP','Observaciones',
    'Status final','Liberado a tiempo','Tipo','Por vencer en 7 días',
  ]
  const exportRows = () => filtered.map(r => {
    const dl = daysLeft(r.limiteQC)
    return [
      r.cod, r.planta, r.desc, r.lote, r.div,
      r.identDeposito, r.limiteQC, r.ingresoFQ, r.status,
      r.nInspeccion, r.prioridad, r.fechaLimPrioridad,
      r.spMicroConthLal, r.spMicroEsterilidad, r.controlHigienico,
      r.fechaFinEsterilidad, r.fechaFinMicro, r.analistFQ,
      r.fechaInicioAnalisis, r.fechaFinAnalisis,
      r.validacionFichaSAP, r.finalQCSAP, r.obs,
      r.statusFinal, r.liberadoATiempo, r.granelCompControl,
      dl !== null && dl >= 0 && dl <= 7 ? 'Sí' : 'No',
    ]
  })

  // Active chips
  const chips: { label: string; onRemove: () => void }[] = [
    ...scrumFilters.plantas.map(v => ({ label: `Planta: ${v}`, onRemove: () => setScrumFilters({ plantas: scrumFilters.plantas.filter(x => x !== v) }) })),
    ...scrumFilters.divisiones.map(v => ({ label: `Div.: ${v}`, onRemove: () => setScrumFilters({ divisiones: scrumFilters.divisiones.filter(x => x !== v) as DivisionScrum[] }) })),
    ...scrumFilters.statuses.map(v => ({ label: `Status: ${v}`, onRemove: () => setScrumFilters({ statuses: scrumFilters.statuses.filter(x => x !== v) as ScrumStatus[] }) })),
    ...scrumFilters.liberacion.map(v => ({ label: `Lib.: ${v}`, onRemove: () => setScrumFilters({ liberacion: scrumFilters.liberacion.filter(x => x !== v) as LiberadoATiempo[] }) })),
    ...scrumFilters.prioridad.map(v => ({ label: `Prioridad: ${v}`, onRemove: () => setScrumFilters({ prioridad: scrumFilters.prioridad.filter(x => x !== v) as ('Sí'|'No')[] }) })),
  ]

  const sortTh = (col: string, label: string) => (
    <SortableTh col={col} currentSort={scrumSort} onSort={setScrumSort}>{label}</SortableTh>
  )
  const plainTh = (label: string) => (
    <th className="px-2.5 py-2 text-left text-[10px] font-mono uppercase tracking-wider text-gray-400 bg-surface-2 border-b border-border whitespace-nowrap">{label}</th>
  )

  return (
    <div>
      {/* Filter bar */}
      <div className="flex gap-1.5 mb-2.5 flex-wrap items-center">
        <MultiFilter
          label="Planta"
          options={[{ value: 'Planta 1', label: 'Planta 1' }, { value: 'Planta 2', label: 'Planta 2' }]}
          selected={scrumFilters.plantas}
          onChange={v => setScrumFilters({ plantas: v })}
        />
        <MultiFilter
          label="División"
          options={DIV_OPTIONS.map(v => ({ value: v, label: v }))}
          selected={scrumFilters.divisiones}
          onChange={v => setScrumFilters({ divisiones: v as DivisionScrum[] })}
        />
        <MultiFilter
          label="Status"
          options={STATUS_OPTIONS.map(v => ({ value: v, label: v }))}
          selected={scrumFilters.statuses}
          onChange={v => setScrumFilters({ statuses: v as ScrumStatus[] })}
        />
        <MultiFilter
          label="Liberación"
          options={LIB_OPTIONS.map(v => ({ value: v, label: v }))}
          selected={scrumFilters.liberacion}
          onChange={v => setScrumFilters({ liberacion: v as LiberadoATiempo[] })}
        />
        <MultiFilter
          label="Prioridad"
          options={[{ value: 'Sí', label: 'Con prioridad' }, { value: 'No', label: 'Sin prioridad' }]}
          selected={scrumFilters.prioridad}
          onChange={v => setScrumFilters({ prioridad: v as ('Sí'|'No')[] })}
        />
        <input
          className="h-8 px-2.5 text-[12px] font-sans border border-border-2 rounded bg-surface text-gray-700 outline-none focus:border-accent transition-all w-48"
          placeholder="Buscar código, desc. o lote..."
          value={scrumFilters.search}
          onChange={e => setScrumFilters({ search: e.target.value })}
        />
        {(chips.length > 0 || scrumFilters.search) && (
          <button
            onClick={clearScrumFilters}
            className="text-[11px] text-danger border border-danger/20 px-2 py-1 rounded hover:bg-danger-light transition-all"
          >
            ✕ Limpiar
          </button>
        )}
        <div className="ml-auto flex gap-1.5">
          {role.canCreate && (
            <Button variant="primary" onClick={() => setPage('form')}>+ Nuevo lote</Button>
          )}
          <div className="relative" ref={exportRef}>
            <Button onClick={() => setExportOpen(o => !o)}>Exportar ▾</Button>
            {exportOpen && (
              <div className="absolute top-full right-0 mt-1 z-50 bg-surface border border-border-2 rounded-lg shadow-lg p-1 min-w-[150px]">
                <button
                  className="block w-full text-left px-3 py-2 text-[12px] hover:bg-surface-2 rounded transition-colors"
                  onClick={() => {
                    setExportOpen(false)
                    csvDownload([HEADERS, ...exportRows()], 'scrum_' + dateStamp())
                  }}
                >
                  CSV (.csv)
                </button>
                <button
                  className="block w-full text-left px-3 py-2 text-[12px] hover:bg-surface-2 rounded transition-colors"
                  onClick={() => {
                    setExportOpen(false)
                    xlsxDownload(HEADERS, exportRows(), 'SCRUM Lotes', 'scrum_' + dateStamp())
                  }}
                >
                  Excel (.xlsx)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {chips.map((c, i) => <FilterChip key={i} label={c.label} onRemove={c.onRemove} />)}
        </div>
      )}

      {/* Table — horizontal scroll for many columns */}
      <div className="overflow-x-auto border border-border rounded-lg bg-surface">
        <table className="border-collapse text-[11px]" style={{ minWidth: '1400px', width: '100%' }}>
          <thead>
            <tr>
              {sortTh('cod', 'Código')}
              {sortTh('planta', 'Planta')}
              {sortTh('desc', 'Descripción')}
              {sortTh('lote', 'Lote')}
              {sortTh('div', 'División')}
              {sortTh('identDeposito', 'Ident. depósito')}
              {sortTh('limiteQC', 'Límite QC')}
              {sortTh('ingresoFQ', 'Ingreso FQ')}
              {sortTh('status', 'Status')}
              {plainTh('Prioridad')}
              {sortTh('analistFQ', 'Analista FQ')}
              {sortTh('fechaInicioAnalisis', 'Inicio análisis')}
              {sortTh('fechaFinAnalisis', 'Fin análisis')}
              {sortTh('validacionFichaSAP', 'Valid. SAP')}
              {sortTh('finalQCSAP', 'Final QC SAP')}
              {sortTh('statusFinal', 'Status final')}
              {sortTh('liberadoATiempo', '¿A tiempo?')}
              {sortTh('granelCompControl', 'Tipo')}
              {plainTh('Por vencer 7d')}
              {plainTh('')}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const dl = daysLeft(r.limiteQC)
              const rowBg =
                r.liberadoATiempo === 'Overdue' ? 'bg-[#fef7f7]' :
                dl !== null && dl <= 3 && r.statusFinal === 'Pendiente' ? 'bg-[#fef8ee]' : ''
              const isExpiring = dl !== null && dl >= 0 && dl <= 7 && r.statusFinal === 'Pendiente'
              return (
                <tr key={r.id} className={`border-b border-border last:border-0 hover:bg-surface-2 transition-colors ${rowBg}`}>
                  <td className="px-2.5 py-2 font-mono">{r.cod}</td>
                  <td className="px-2.5 py-2 whitespace-nowrap">{r.planta}</td>
                  <td className="px-2.5 py-2 max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap" title={r.desc}>{r.desc}</td>
                  <td className="px-2.5 py-2 font-mono">{r.lote}</td>
                  <td className="px-2.5 py-2">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-surface-2 text-gray-500">{r.div}</span>
                  </td>
                  <td className="px-2.5 py-2 whitespace-nowrap">{r.identDeposito}</td>
                  <td className={`px-2.5 py-2 whitespace-nowrap ${dl !== null && dl < 0 ? 'text-danger font-medium' : dl !== null && dl <= 3 ? 'text-warning font-medium' : ''}`}>
                    {r.limiteQC}
                  </td>
                  <td className="px-2.5 py-2 whitespace-nowrap">{r.ingresoFQ || '—'}</td>
                  <td className="px-2.5 py-2 whitespace-nowrap">{r.status}</td>
                  <td className="px-2.5 py-2">
                    {r.prioridad === 'Sí'
                      ? <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium font-mono bg-danger-light text-danger-text">Sí</span>
                      : <span className="text-gray-400">No</span>
                    }
                  </td>
                  <td className="px-2.5 py-2 whitespace-nowrap">{r.analistFQ || '—'}</td>
                  <td className="px-2.5 py-2 whitespace-nowrap">{r.fechaInicioAnalisis || '—'}</td>
                  <td className="px-2.5 py-2 whitespace-nowrap">{r.fechaFinAnalisis || '—'}</td>
                  <td className="px-2.5 py-2 whitespace-nowrap">{r.validacionFichaSAP || '—'}</td>
                  <td className="px-2.5 py-2 whitespace-nowrap">{r.finalQCSAP || '—'}</td>
                  <td className="px-2.5 py-2"><StatusFinalBadge value={r.statusFinal} /></td>
                  <td className="px-2.5 py-2"><LiberadoBadge value={r.liberadoATiempo} /></td>
                  <td className="px-2.5 py-2 whitespace-nowrap">{r.granelCompControl}</td>
                  <td className="px-2.5 py-2 text-center">
                    {isExpiring
                      ? <span className="inline-block w-2 h-2 rounded-full bg-warning" title="Por vencer en 7 días" />
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-2.5 py-2">
                    <button
                      onClick={() => showDetail(r.id)}
                      className="text-accent underline text-[11px] hover:text-accent-text transition-colors whitespace-nowrap"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              )
            })}
            {!filtered.length && (
              <tr>
                <td colSpan={20} className="px-3 py-10 text-center text-gray-400">
                  Sin resultados para los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-[11px] text-gray-400 font-mono">
        {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
