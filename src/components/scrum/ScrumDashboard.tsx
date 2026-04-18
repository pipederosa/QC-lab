'use client'
// src/components/scrum/ScrumDashboard.tsx
// Versión simplificada — estructura idéntica a EstDashboard pero con datos SCRUM

import React from 'react'
import { useAppStore } from '@/store/appStore'
import { KpiCard, Card, CardTitle } from '@/components/ui'
import { daysLeft } from '@/lib/utils'

function BarChart({ data }: { data: { q: string; pct: number }[] }) {
  return (
    <div className="flex flex-col gap-2">
      {data.map(({ q, pct }) => {
        const col = pct >= 80 ? '#639922' : pct >= 60 ? '#EF9F27' : '#E24B4A'
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

export default function ScrumDashboard() {
  const { scrumRecords, scrumDashLoc, setScrumDashLoc, scrumDashDiv, setScrumDashDiv, setScrumKpiFilter, setPage } = useAppStore()

  const data = React.useMemo(() => {
    let d = [...scrumRecords]
    if (scrumDashLoc === 'p1') d = d.filter(r => r.planta === 'Planta 1')
    if (scrumDashLoc === 'p2') d = d.filter(r => r.planta === 'Planta 2')
    if (scrumDashDiv !== 'todas') d = d.filter(r => r.div === scrumDashDiv)
    return d
  }, [scrumRecords, scrumDashLoc, scrumDashDiv])

  const today = Date.now()
  const weekMs = 7 * 86400000
  const overdue    = data.filter(r => r.liberadoATiempo === 'Overdue').length
  const semana     = data.filter(r => { const dl = daysLeft(r.limiteQC); return dl !== null && dl >= 0 && dl <= 7 && r.statusFinal === 'Pendiente' }).length
  const ingresados = data.filter(r => { const dt = r.identDeposito ? new Date(r.identDeposito.split('/').reverse().join('-')).getTime() : 0; return dt && (today - dt) <= weekMs }).length
  const terminados = data.filter(r => r.statusFinal === 'Terminado')
  const atime      = terminados.filter(r => r.liberadoATiempo === 'Cumplió').length
  const mes        = data.filter(r => { if (!r.identDeposito) return false; const dt = new Date(r.identDeposito.split('/').reverse().join('-')); return dt.getMonth() === new Date().getMonth() }).length

  const qData = [
    { q: 'Q1 2025', pct: 80 }, { q: 'Q2 2025', pct: 91 },
    { q: 'Q3 2025', pct: 75 }, { q: 'Q4 2025', pct: 87 },
    { q: 'Q1 2026', pct: terminados.length ? Math.round(atime / terminados.length * 100) : 0 },
  ]

  const goResults = (f: string) => { setScrumKpiFilter(f); setPage('results') }

  const expiring = data
    .filter(r => { const dl = daysLeft(r.limiteQC); return (dl !== null && dl <= 7 && r.statusFinal === 'Pendiente') || r.liberadoATiempo === 'Overdue' })
    .sort((a, b) => (daysLeft(a.limiteQC) ?? 9999) - (daysLeft(b.limiteQC) ?? 9999))
    .slice(0, 8)

  const locLabel = scrumDashLoc === 'todas' ? 'Todos' : scrumDashLoc === 'p1' ? 'Planta 1' : 'Planta 2'
  const divLabel = scrumDashDiv !== 'todas' ? ` · ${scrumDashDiv}` : ''

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-4 bg-surface-2 border border-border rounded-lg px-4 py-2.5 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">Planta:</span>
          {([['todas', 'Todas'], ['p1', 'Planta 1'], ['p2', 'Planta 2']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setScrumDashLoc(val)}
              className={['px-3 py-1 rounded-full border text-[12px] transition-all',
                scrumDashLoc === val ? 'bg-accent-light border-accent text-accent-text font-medium' : 'bg-surface border-border-2 text-gray-400 hover:border-accent hover:text-accent-text'].join(' ')}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">División:</span>
          {([['todas', 'Todas'], ['PH', 'PH'], ['CH', 'CH'], ['INY', 'INY']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setScrumDashDiv(val)}
              className={['px-3 py-1 rounded-full border text-[12px] transition-all',
                scrumDashDiv === val ? 'bg-accent-light border-accent text-accent-text font-medium' : 'bg-surface border-border-2 text-gray-400 hover:border-accent hover:text-accent-text'].join(' ')}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-2.5">
        <KpiCard label="Overdue" value={overdue} sub="fuera de tiempo" color="danger" onClick={() => goResults('overdue')} />
        <KpiCard label="Por vencer esta semana" value={semana} sub="próximos 7 días" color="warning" onClick={() => goResults('semana')} />
        <KpiCard label="Ingresados esta semana" value={ingresados} sub="lotes nuevos" color="info" onClick={() => goResults('ingresados')} />
        <KpiCard label="Liberados a tiempo" value={terminados.length ? `${Math.round(atime / terminados.length * 100)}%` : '—'} sub="de los terminados" color="success" />
        <KpiCard label="Lotes este mes" value={mes} sub="identificados" color="warning" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardTitle>{`Liberados a tiempo vs Overdue — ${locLabel}${divLabel}`}</CardTitle>
          <BarChart data={qData} />
        </Card>
        <Card>
          <CardTitle>Estado de lotes</CardTitle>
          <div className="space-y-2 mt-2">
            {[
              { label: 'Terminados', count: terminados.length, color: '#27500A' },
              { label: 'Pendientes', count: data.filter(r => r.statusFinal === 'Pendiente').length, color: '#185FA5' },
              { label: 'Overdue', count: overdue, color: '#E24B4A' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-2 text-[11px] text-gray-500">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                {label}: <strong>{count}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Expiring */}
      <Card>
        <CardTitle>Lotes próximos a vencer / overdue</CardTitle>
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-[12px] border-collapse">
            <thead><tr className="bg-surface-2 border-b border-border">
              {['Código','Descripción','Lote','Límite QC','Días','Planta','Status'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-gray-400">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {expiring.map(r => {
                const dl = daysLeft(r.limiteQC)
                const rowBg = dl !== null && dl < 0 ? 'bg-[#fef7f7]' : dl !== null && dl <= 3 ? 'bg-[#fef8ee]' : ''
                const dlTxt = dl !== null && dl < 0 ? <span className="text-danger font-medium">Overdue</span> : dl !== null && dl <= 7 ? <span className="text-warning font-medium">{dl}d</span> : `${dl}d`
                return (
                  <tr key={r.id} className={`border-b border-border last:border-0 hover:bg-surface-2 ${rowBg}`}>
                    <td className="px-3 py-2">{r.cod}</td>
                    <td className="px-3 py-2">{r.desc}</td>
                    <td className="px-3 py-2">{r.lote}</td>
                    <td className="px-3 py-2">{r.limiteQC}</td>
                    <td className="px-3 py-2">{dlTxt}</td>
                    <td className="px-3 py-2">{r.planta}</td>
                    <td className="px-3 py-2">
                      <span className={['inline-block px-2 py-0.5 rounded-full text-[10px] font-medium font-mono',
                        r.statusFinal === 'Terminado' ? 'bg-success-light text-success-text' : 'bg-accent-light text-accent-text'].join(' ')}>
                        {r.statusFinal}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {!expiring.length && <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400">Sin lotes por vencer.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
