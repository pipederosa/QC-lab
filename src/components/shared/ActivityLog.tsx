'use client'
// src/components/shared/ActivityLog.tsx

import React, { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { Button } from '@/components/ui'
import { csvDownload, dateStamp } from '@/lib/utils'
import type { AuditModule } from '@/types'

const MODULE_LABELS: Record<AuditModule, string> = {
  est:   'Estabilidades',
  scrum: 'SCRUM',
  sys:   'Sistema',
}

const MODULE_COLORS: Record<AuditModule, string> = {
  est:   'bg-accent-light text-accent-text',
  scrum: 'bg-success-light text-success-text',
  sys:   'bg-surface-2 text-gray-500',
}

export default function ActivityLog() {
  const { auditLog } = useAppStore()
  const [search, setSearch]  = useState('')
  const [modFilter, setModFilter] = useState<'' | AuditModule>('')

  const filtered = useMemo(() => {
    let logs = [...auditLog]
    if (modFilter) logs = logs.filter(a => a.module === modFilter)
    if (search) {
      const q = search.toLowerCase()
      logs = logs.filter(a =>
        a.who.toLowerCase().includes(q) ||
        a.what.toLowerCase().includes(q)
      )
    }
    return logs
  }, [auditLog, search, modFilter])

  const exportCSV = () => {
    const headers = ['Usuario', 'Módulo', 'Acción', 'Campo', 'Valor anterior', 'Valor nuevo', 'Fecha y hora', 'ID Registro']
    const rows = filtered.map(a => [
      a.who,
      MODULE_LABELS[a.module] ?? a.module,
      a.what,
      a.field || '',
      a.old || '',
      a.new || '',
      a.when,
      a.study ?? '',
    ])
    csvDownload([headers, ...rows], 'actividad_' + dateStamp())
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <input
          className="h-8 px-2.5 w-56 text-[12px] font-sans border border-border-2 rounded bg-surface text-gray-700 outline-none focus:border-accent transition-all"
          placeholder="Buscar usuario o acción..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="h-8 px-2.5 text-[12px] font-sans border border-border-2 rounded bg-surface text-gray-700 outline-none focus:border-accent transition-all"
          value={modFilter}
          onChange={e => setModFilter(e.target.value as '' | AuditModule)}
        >
          <option value="">Todos los módulos</option>
          <option value="est">Estabilidades</option>
          <option value="scrum">SCRUM</option>
          <option value="sys">Sistema</option>
        </select>
        <div className="ml-auto">
          <Button onClick={exportCSV}>Exportar CSV</Button>
        </div>
      </div>

      {/* Log */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <div className="text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-4 pb-2 border-b border-border flex items-center justify-between">
          <span>Registro de actividad — inmutable (GxP / 21 CFR Part 11)</span>
          <span className="text-gray-300">{filtered.length} entradas</span>
        </div>

        {filtered.length > 0 ? (
          <div>
            {filtered.map((a, i) => (
              <div
                key={i}
                className="flex gap-3 py-2.5 border-b border-border last:border-0 text-[12px] hover:bg-surface-2 -mx-4 px-4 transition-colors"
              >
                <div className="font-mono font-medium text-[11px] min-w-[90px] flex-shrink-0 text-gray-700">
                  {a.who}
                </div>
                <div className="flex-1 leading-snug text-gray-500 flex items-start gap-2 flex-wrap">
                  <span
                    className={[
                      'inline-block text-[9px] font-mono font-medium px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0 mt-0.5',
                      MODULE_COLORS[a.module] ?? 'bg-surface-2 text-gray-400',
                    ].join(' ')}
                  >
                    {MODULE_LABELS[a.module] ?? a.module}
                  </span>
                  <span>{a.what}</span>
                </div>
                <div className="font-mono text-[10px] text-gray-400 min-w-[110px] text-right flex-shrink-0">
                  {a.when}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 text-[13px]">
            Sin registros para los filtros aplicados.
          </div>
        )}
      </div>
    </div>
  )
}
