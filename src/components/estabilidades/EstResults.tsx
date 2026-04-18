'use client'
// src/components/estabilidades/EstResults.tsx

import React from 'react'
import { useAppStore } from '@/store/appStore'
import { ROLES } from '@/lib/roles'
import { ALL_UBICACIONES } from '@/lib/data'
import {
  MultiFilter, FilterChip, Button, SortableTh, EstBadge,
} from '@/components/ui'
import {
  daysLeft, isStudyExpired, isStudyExpiringSoon, compareVal,
  csvDownload, xlsxDownload, dateStamp,
} from '@/lib/utils'
import type { EstadoEstudio, Division, Study } from '@/types'

const ESTADO_OPTIONS: EstadoEstudio[] = ['Pendiente', 'En proceso', 'Completo', 'Cancelado']
const DIV_OPTIONS: Division[] = ['CH', 'PH']

export default function EstResults() {
  const {
    studies, estFilters, setEstFilters, clearEstFilters,
    estSort, setEstSort, estKpiFilter, setEstKpiFilter,
    currentUser, setPage, setCurrentEstDetailId,
  } = useAppStore()
  const role = ROLES[currentUser.rol]

  const [exportOpen, setExportOpen] = React.useState(false)
  const exportRef = React.useRef<HTMLDivElement>(null)

  // Apply KPI filter on mount
  React.useEffect(() => {
    if (!estKpiFilter) return
    clearEstFilters()
    if (estKpiFilter === 'curso')    setEstFilters({ estados: ['Pendiente', 'En proceso'] })
    if (estKpiFilter === 'vencidos') setEstFilters({ estados: ['En proceso'] })
    if (estKpiFilter === 'oos')      setEstFilters({ oos: ['si'] })
    setEstKpiFilter(null)
  }, []) // eslint-disable-line

  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = React.useMemo(() => {
    let data = [...studies]
    if (estFilters.estados.length)    data = data.filter(s => estFilters.estados.includes(s.estado))
    if (estFilters.plantas.length)    data = data.filter(s => estFilters.plantas.includes(s.planta))
    if (estFilters.ubicaciones.length)data = data.filter(s => estFilters.ubicaciones.includes(s.ubic))
    if (estFilters.divisiones.length) data = data.filter(s => estFilters.divisiones.includes(s.div))
    if (estFilters.oos.includes('si') && !estFilters.oos.includes('no')) data = data.filter(s => s.oos)
    if (estFilters.oos.includes('no') && !estFilters.oos.includes('si')) data = data.filter(s => !s.oos)
    if (estFilters.search) {
      const q = estFilters.search.toLowerCase()
      data = data.filter(s => s.prod.toLowerCase().includes(q) || s.lote.toLowerCase().includes(q))
    }
    if (estSort.col) {
      data = data.slice().sort((a, b) => compareVal(a, b, estSort.col!) * estSort.dir)
    }
    return data
  }, [studies, estFilters, estSort])

  const showDetail = (id: number) => { setCurrentEstDetailId(id); setPage('full') }

  const exportData = () => filtered.map(s => [
    s.id, s.cod, s.prod, s.lote, s.div, s.planta, s.ubic, s.cond, s.tiempo,
    s.ingreso, s.teorica, s.limite, s.estado, s.oos ? 'Sí' : 'No', s.oos_obs,
    s.cumpl, s.aprob, s.analistFQ, s.contenido, s.deg1, s.deg2, s.deg3, s.disol, s.obs,
  ])
  const exportHeaders = ['ID','Código','Producto','Lote','División','Planta','Ubicación','Condiciones','Tiempo','F.Ingreso','F.Teórica','F.Límite','Estado','OOS','OOS Obs.','Cumplió','Aprobación','Analista FQ','Contenido','Deg.1','Deg.2','Deg.3','Disolución','Observaciones']

  const chips: { label: string; onRemove: () => void }[] = [
    ...estFilters.estados.map(v => ({ label: `Estado: ${v}`, onRemove: () => setEstFilters({ estados: estFilters.estados.filter(x => x !== v) }) })),
    ...estFilters.plantas.map(v => ({ label: `Planta: ${v}`, onRemove: () => setEstFilters({ plantas: estFilters.plantas.filter(x => x !== v) }) })),
    ...estFilters.ubicaciones.map(v => ({ label: `Ubic.: ${v}`, onRemove: () => setEstFilters({ ubicaciones: estFilters.ubicaciones.filter(x => x !== v) }) })),
    ...estFilters.divisiones.map(v => ({ label: `Div.: ${v}`, onRemove: () => setEstFilters({ divisiones: estFilters.divisiones.filter(x => x !== v) }) })),
    ...estFilters.oos.map(v => ({ label: v === 'si' ? 'Con OOS' : 'Sin OOS', onRemove: () => setEstFilters({ oos: estFilters.oos.filter(x => x !== v) }) })),
  ]

  return (
    <div>
      {/* Filter bar */}
      <div className="flex gap-1.5 mb-2.5 flex-wrap items-center">
        <MultiFilter
          label="Estado"
          options={ESTADO_OPTIONS.map(v => ({ value: v, label: v }))}
          selected={estFilters.estados}
          onChange={v => setEstFilters({ estados: v as EstadoEstudio[] })}
        />
        <MultiFilter
          label="Planta"
          options={[{ value: 'Planta 1', label: 'Planta 1' }, { value: 'Planta 2', label: 'Planta 2' }]}
          selected={estFilters.plantas}
          onChange={v => setEstFilters({ plantas: v })}
        />
        <MultiFilter
          label="Ubicación física"
          options={ALL_UBICACIONES.map(v => ({ value: v, label: v }))}
          selected={estFilters.ubicaciones}
          onChange={v => setEstFilters({ ubicaciones: v })}
        />
        <MultiFilter
          label="División"
          options={DIV_OPTIONS.map(v => ({ value: v, label: v }))}
          selected={estFilters.divisiones}
          onChange={v => setEstFilters({ divisiones: v as Division[] })}
        />
        <MultiFilter
          label="OOS"
          options={[{ value: 'si', label: 'Con OOS' }, { value: 'no', label: 'Sin OOS' }]}
          selected={estFilters.oos}
          onChange={v => setEstFilters({ oos: v as ('si' | 'no')[] })}
        />
        <input
          className="h-8 px-2.5 text-[12px] font-sans border border-border-2 rounded bg-surface text-gray-700 outline-none focus:border-accent transition-all w-44"
          placeholder="Buscar producto o lote..."
          value={estFilters.search}
          onChange={e => setEstFilters({ search: e.target.value })}
        />
        {(chips.length > 0 || estFilters.search) && (
          <button
            onClick={clearEstFilters}
            className="text-[11px] text-danger border border-danger/20 px-2 py-1 rounded hover:bg-danger-light transition-all"
          >
            ✕ Limpiar
          </button>
        )}
        <div className="ml-auto flex gap-1.5">
          {role.canCreate && (
            <Button variant="primary" onClick={() => setPage('form')}>+ Nuevo estudio</Button>
          )}
          <div className="relative" ref={exportRef}>
            <Button onClick={() => setExportOpen(o => !o)}>Exportar ▾</Button>
            {exportOpen && (
              <div className="absolute top-full right-0 mt-1 z-50 bg-surface border border-border-2 rounded-lg shadow-lg p-1 min-w-[150px]">
                <button className="block w-full text-left px-3 py-2 text-[12px] hover:bg-surface-2 rounded transition-colors"
                  onClick={() => { setExportOpen(false); csvDownload([exportHeaders, ...exportData()], 'estabilidades_' + dateStamp()) }}>
                  CSV (.csv)
                </button>
                <button className="block w-full text-left px-3 py-2 text-[12px] hover:bg-surface-2 rounded transition-colors"
                  onClick={() => { setExportOpen(false); xlsxDownload(exportHeaders, exportData(), 'Estabilidades', 'estabilidades_' + dateStamp()) }}>
                  Excel (.xlsx)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {chips.map((c, i) => <FilterChip key={i} label={c.label} onRemove={c.onRemove} />)}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-lg bg-surface">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr>
              <SortableTh col="prod"    currentSort={estSort} onSort={setEstSort}>Producto</SortableTh>
              <SortableTh col="lote"    currentSort={estSort} onSort={setEstSort}>Lote</SortableTh>
              <th className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-gray-400 bg-surface-2 border-b border-border">Condiciones</th>
              <SortableTh col="tiempo"  currentSort={estSort} onSort={setEstSort}>T. estab.</SortableTh>
              <SortableTh col="ingreso" currentSort={estSort} onSort={setEstSort}>F. ingreso</SortableTh>
              <SortableTh col="teorica" currentSort={estSort} onSort={setEstSort}>F. teórica</SortableTh>
              <SortableTh col="limite"  currentSort={estSort} onSort={setEstSort}>F. límite</SortableTh>
              <SortableTh col="estado"  currentSort={estSort} onSort={setEstSort}>Estado</SortableTh>
              <th className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-gray-400 bg-surface-2 border-b border-border">OOS</th>
              <SortableTh col="planta"  currentSort={estSort} onSort={setEstSort}>Planta</SortableTh>
              <th className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-gray-400 bg-surface-2 border-b border-border">Ubicación</th>
              <th className="px-3 py-2.5 bg-surface-2 border-b border-border" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => {
              const dl = daysLeft(s.limite)
              const rowBg = isStudyExpired(s) ? 'bg-[#fef7f7]' : isStudyExpiringSoon(s, 15) ? 'bg-[#fef8ee]' : ''
              const limStyle = dl !== null && dl < 0 ? 'text-danger font-medium' : dl !== null && dl <= 15 ? 'text-warning font-medium' : ''
              return (
                <tr key={s.id} className={`border-b border-border last:border-0 hover:bg-surface-2 transition-colors ${rowBg}`}>
                  <td className="px-3 py-2 max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap" title={s.prod}>{s.prod}</td>
                  <td className="px-3 py-2">{s.lote}</td>
                  <td className="px-3 py-2 max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap" title={s.cond}>{s.cond}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{s.tiempo}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{s.ingreso}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{s.teorica}</td>
                  <td className={`px-3 py-2 whitespace-nowrap ${limStyle}`}>{s.limite}</td>
                  <td className="px-3 py-2"><EstBadge estado={s.estado} /></td>
                  <td className="px-3 py-2">
                    {s.oos
                      ? <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium font-mono bg-danger-light text-danger-text">OOS</span>
                      : <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium font-mono bg-success-light text-success-text">No</span>
                    }
                  </td>
                  <td className="px-3 py-2">{s.planta}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{s.ubic}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => showDetail(s.id)}
                      className="text-accent underline text-[11px] hover:text-accent-text transition-colors"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              )
            })}
            {!filtered.length && (
              <tr><td colSpan={12} className="px-3 py-10 text-center text-gray-400">Sin resultados para los filtros aplicados.</td></tr>
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
