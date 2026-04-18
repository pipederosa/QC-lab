'use client'
// src/components/estabilidades/EstDashboard.tsx

import React from 'react'
import { useAppStore } from '@/store/appStore'
import { KpiCard, Card, CardTitle } from '@/components/ui'
import { EstBadge } from '@/components/ui'
import {
  daysLeft, isStudyExpired, isStudyExpiringSoon,
} from '@/lib/utils'
import {
  QUARTERS_TODAS, QUARTERS_P1, QUARTERS_P2,
} from '@/lib/data'
import type { Study } from '@/types'

function BarChart({ data }: { data: { q: string; pct: number }[] }) {
  return (
    <div className="flex flex-col gap-2">
      {data.map(({ q, pct }) => {
        const col = pct >= 85 ? '#639922' : pct >= 75 ? '#EF9F27' : '#E24B4A'
        return (
          <div key={q} className="flex items-center gap-2.5">
            <div className="w-[62px] text-right text-[11px] font-mono text-gray-400 flex-shrink-0">{q}</div>
            <div className="flex-1 bg-surface-2 rounded h-4 overflow-hidden">
              <div className="h-full rounded transition-all duration-500" style={{ width: `${pct}%`, background: col }} />
            </div>
            <div className="w-9 text-right text-[12px] font-mono font-medium" style={{ color: col }}>{pct}%</div>
          </div>
        )
      })}
    </div>
  )
}

export default function EstDashboard() {
  const { studies, estDashLoc, setEstDashLoc, setEstKpiFilter, setPage } = useAppStore()

  const data = React.useMemo(() => {
    if (estDashLoc === 'p1') return studies.filter(s => s.planta === 'Planta 1')
    if (estDashLoc === 'p2') return studies.filter(s => s.planta === 'Planta 2')
    return studies
  }, [studies, estDashLoc])

  const quarters = estDashLoc === 'p1' ? QUARTERS_P1 : estDashLoc === 'p2' ? QUARTERS_P2 : QUARTERS_TODAS
  const trendTitle = estDashLoc === 'p1' ? 'Tendencia — Planta 1' : estDashLoc === 'p2' ? 'Tendencia — Planta 2' : 'Tendencia — Todas las plantas'

  const active   = data.filter(s => s.estado === 'En proceso' || s.estado === 'Pendiente').length
  const expired  = data.filter(isStudyExpired).length
  const soon     = data.filter(s => isStudyExpiringSoon(s, 30)).length
  const complied = data.filter(s => s.cumpl === 'Sí').length
  const pct      = data.length ? Math.round(complied / data.length * 100) : 0
  const oos      = data.filter(s => s.oos).length
  const pending  = data.filter(s => s.aprob === 'Pendiente').length

  const goResults = (filter: string) => { setEstKpiFilter(filter); setPage('results') }

  const legendData = [
    { label: 'Completos',  count: data.filter(s => s.estado === 'Completo').length,   color: '#27500A' },
    { label: 'En proceso', count: data.filter(s => s.estado === 'En proceso').length, color: '#EF9F27' },
    { label: 'Pendientes', count: data.filter(s => s.estado === 'Pendiente').length,  color: '#185FA5' },
    { label: 'Cancelados', count: data.filter(s => s.estado === 'Cancelado').length,  color: '#888780' },
    { label: 'Vencidos',   count: expired,                                             color: '#E24B4A' },
  ]

  const expiring: Study[] = data
    .filter(s => isStudyExpiringSoon(s, 30) || isStudyExpired(s))
    .sort((a, b) => (daysLeft(a.limite) ?? 9999) - (daysLeft(b.limite) ?? 9999))
    .slice(0, 8)

  const circum = 2 * Math.PI * 42
  const arcLen = (pct / 100) * circum
  const arcColor = pct >= 85 ? '#639922' : pct >= 70 ? '#EF9F27' : '#E24B4A'

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2.5 bg-surface-2 border border-border rounded-lg px-4 py-2.5 flex-wrap">
        <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider flex-shrink-0">Planta:</span>
        {([['todas', 'Todas las plantas'], ['p1', 'Planta 1'], ['p2', 'Planta 2']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setEstDashLoc(val)}
            className={[
              'px-3 py-1 rounded-full border text-[12px] font-sans transition-all',
              estDashLoc === val
                ? 'bg-accent-light border-accent text-accent-text font-medium'
                : 'bg-surface border-border-2 text-gray-400 hover:border-accent hover:text-accent-text',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-6 gap-2.5">
        <KpiCard label="En curso"          value={active}  sub="estudios activos"  color="info"    onClick={() => goResults('curso')} />
        <KpiCard label="Vencidos"          value={expired} sub="sin completar"     color="danger"  onClick={() => goResults('vencidos')} />
        <KpiCard label="Próx. a vencer"    value={soon}    sub="en 30 días"        color="warning" onClick={() => goResults('proximos')} />
        <KpiCard label="% Cumplimiento"    value={`${pct}%`} sub="período actual"  color="success" />
        <KpiCard label="OOS activos"       value={oos}     sub="en investigación"  color="danger"  onClick={() => goResults('oos')} />
        <KpiCard label="Aprob. pendientes" value={pending} sub="esperando firma"   color="warning" onClick={() => goResults('aprob')} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardTitle>{trendTitle}</CardTitle>
          <BarChart data={quarters} />
        </Card>
        <Card>
          <CardTitle>Estado de estudios</CardTitle>
          <div className="relative w-[110px] h-[110px] mx-auto mb-3">
            <svg viewBox="0 0 110 110" className="w-[110px] h-[110px]">
              <circle cx="55" cy="55" r="42" fill="none" stroke="#e2e0d8" strokeWidth="14" />
              <circle
                cx="55" cy="55" r="42" fill="none" stroke={arcColor} strokeWidth="14"
                strokeDasharray={`${arcLen.toFixed(1)} ${circum.toFixed(1)}`}
                strokeDashoffset="66" strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.3s' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-xl font-light font-mono">{pct}%</div>
              <div className="text-[10px] text-gray-400 font-mono">cumpl.</div>
            </div>
          </div>
          <div className="space-y-1.5">
            {legendData.map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-2 text-[11px] text-gray-500">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                {label}: <strong>{count}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Expiring table */}
      <Card>
        <CardTitle>Estudios próximos a vencer (30 días)</CardTitle>
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr className="bg-surface-2 border-b border-border">
                {['Producto','Lote','Condiciones','F. límite','Días','Ubicación','Estado'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expiring.map(s => {
                const dl = daysLeft(s.limite)
                const rowBg = dl !== null && dl < 0 ? 'bg-[#fef7f7]' : dl !== null && dl <= 15 ? 'bg-[#fef8ee]' : ''
                const dlText = dl !== null && dl < 0
                  ? <span className="text-danger font-medium">Vencido</span>
                  : dl !== null && dl <= 15
                  ? <span className="text-warning font-medium">{dl}d</span>
                  : `${dl}d`
                return (
                  <tr key={s.id} className={`border-b border-border last:border-0 hover:bg-surface-2 ${rowBg}`}>
                    <td className="px-3 py-2">{s.prod}</td>
                    <td className="px-3 py-2">{s.lote}</td>
                    <td className="px-3 py-2">{s.cond}</td>
                    <td className="px-3 py-2">{s.limite}</td>
                    <td className="px-3 py-2">{dlText}</td>
                    <td className="px-3 py-2">{s.planta} · {s.ubic}</td>
                    <td className="px-3 py-2"><EstBadge estado={s.estado} /></td>
                  </tr>
                )
              })}
              {!expiring.length && (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400 text-[12px]">No hay estudios próximos a vencer.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
