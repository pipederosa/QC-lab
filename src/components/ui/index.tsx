'use client'
// src/components/ui/index.tsx
// Componentes UI reutilizables tipados

import React from 'react'
import { cn } from '@/lib/utils'
import type { EstadoEstudio, LiberadoATiempo, StatusFinal } from '@/types'

// ============================================================
// BADGE
// ============================================================

const BADGE_VARIANTS = {
  pendiente: 'bg-accent-light text-accent-text',
  proceso:   'bg-warning-light text-warning-text',
  completo:  'bg-success-light text-success-text',
  cancelado: 'bg-surface-2 text-gray-500',
  oos:       'bg-danger-light text-danger-text',
  ok:        'bg-success-light text-success-text',
  overdue:   'bg-danger-light text-danger-text',
} as const

type BadgeVariant = keyof typeof BADGE_VARIANTS

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-block px-2 py-0.5 rounded-full text-[10px] font-medium font-mono whitespace-nowrap',
      BADGE_VARIANTS[variant],
      className
    )}>
      {children}
    </span>
  )
}

export function EstBadge({ estado }: { estado: EstadoEstudio }) {
  const map: Record<EstadoEstudio, BadgeVariant> = {
    'Pendiente':  'pendiente',
    'En proceso': 'proceso',
    'Completo':   'completo',
    'Cancelado':  'cancelado',
  }
  return <Badge variant={map[estado]}>{estado}</Badge>
}

export function ScrumStatusBadge({ status }: { status: StatusFinal }) {
  return <Badge variant={status === 'Terminado' ? 'completo' : 'pendiente'}>{status}</Badge>
}

export function LiberadoBadge({ value }: { value: LiberadoATiempo }) {
  if (value === 'Cumplió')  return <Badge variant="completo">Cumplió</Badge>
  if (value === 'Overdue')  return <Badge variant="oos">Overdue</Badge>
  return <Badge variant="pendiente">Pendiente</Badge>
}

// ============================================================
// BUTTON
// ============================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({
  variant = 'ghost', size = 'md', className, children, ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded border font-sans transition-all active:scale-[.98] whitespace-nowrap cursor-pointer',
        size === 'sm' ? 'px-2.5 py-1 text-[11px] h-7' : 'px-3.5 py-1.5 text-[12px]',
        variant === 'primary'
          ? 'bg-accent text-white border-accent hover:bg-accent-text'
          : variant === 'danger'
          ? 'bg-danger-light text-danger-text border-danger/30 hover:bg-danger hover:text-white'
          : 'bg-surface text-gray-500 border-border-2 hover:bg-surface-2 hover:text-gray-800',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// ============================================================
// KPI CARD
// ============================================================

type KpiColor = 'info' | 'danger' | 'warning' | 'success'

interface KpiCardProps {
  label: string
  value: string | number
  sub: string
  color: KpiColor
  onClick?: () => void
}

const KPI_COLORS: Record<KpiColor, string> = {
  info:    'text-accent',
  danger:  'text-danger',
  warning: 'text-warning',
  success: 'text-success',
}

export function KpiCard({ label, value, sub, color, onClick }: KpiCardProps) {
  return (
    <div
      className={cn(
        'bg-surface-2 rounded p-3.5 border border-transparent transition-all',
        onClick && 'cursor-pointer hover:-translate-y-px hover:border-border-2'
      )}
      onClick={onClick}
    >
      <div className="text-[10px] uppercase tracking-wider font-mono text-gray-400 mb-1.5">{label}</div>
      <div className={cn('text-3xl font-light leading-none', KPI_COLORS[color])}>{value}</div>
      <div className="text-[11px] text-gray-400 mt-1">{sub}</div>
    </div>
  )
}

// ============================================================
// SORTABLE TABLE HEADER
// ============================================================

interface SortableThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  col: string
  currentSort: { col: string | null; dir: 1 | -1 }
  onSort: (col: string) => void
  children: React.ReactNode
}

export function SortableTh({ col, currentSort, onSort, children, className, ...rest }: SortableThProps) {
  const active = currentSort.col === col
  return (
    <th
      className={cn(
        'px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-gray-400 bg-surface-2',
        'border-b border-border whitespace-nowrap cursor-pointer select-none hover:text-gray-600',
        active && 'text-accent',
        className
      )}
      onClick={() => onSort(col)}
      {...rest}
    >
      {children}
      {active && (
        <span className="ml-1 text-[10px]">{currentSort.dir === 1 ? '↑' : '↓'}</span>
      )}
    </th>
  )
}

// ============================================================
// MULTI-SELECT FILTER DROPDOWN
// ============================================================

interface MultiFilterOption {
  value: string
  label: string
}

interface MultiFilterProps {
  label: string
  options: MultiFilterOption[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function MultiFilter({ label, options, selected, onChange }: MultiFilterProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val])
  }

  const hasSelection = selected.length > 0

  return (
    <div className="relative" ref={ref}>
      <button
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 h-8 rounded border text-[12px] font-sans transition-all whitespace-nowrap',
          hasSelection
            ? 'border-accent bg-accent-light text-accent-text font-medium'
            : 'border-border-2 bg-surface text-gray-500 hover:border-accent hover:text-accent-text'
        )}
        onClick={() => setOpen(o => !o)}
      >
        {label}
        {hasSelection && (
          <span className="bg-accent text-white text-[10px] font-mono rounded-full px-1.5 min-w-[18px] text-center">
            {selected.length}
          </span>
        )}
        <span className="text-[10px] text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-surface border border-border-2 rounded-lg shadow-lg p-1.5 min-w-[170px]">
          {options.map(opt => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-surface-2 text-[12px] text-gray-700"
            >
              <input
                type="checkbox"
                className="accent-[#185FA5] w-3.5 h-3.5"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// FILTER CHIP
// ============================================================

interface FilterChipProps {
  label: string
  onRemove: () => void
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <div className="flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 bg-accent-light border border-accent rounded-full text-[11px] text-accent-text">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="text-[13px] leading-none hover:text-danger transition-colors"
      >
        ×
      </button>
    </div>
  )
}

// ============================================================
// CARD
// ============================================================

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-surface border border-border rounded-lg p-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('text-[11px] uppercase tracking-wider font-mono text-gray-400 mb-3.5', className)}>
      {children}
    </div>
  )
}

// ============================================================
// DETAIL INLINE INPUTS
// ============================================================

interface DetailFieldProps {
  label: string
  value: string
  editable: boolean
  type?: 'text' | 'date' | 'select' | 'textarea'
  options?: string[]
  onSave: (val: string) => void
}

export function DetailField({ label, value, editable, type = 'text', options = [], onSave }: DetailFieldProps) {
  const inputClass = 'w-full px-1.5 py-1 rounded border border-border-2 bg-surface text-[12px] font-sans text-gray-700 outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all'

  const displayVal = value || '—'

  if (!editable) {
    return (
      <tr className="border-b border-border last:border-0">
        <td className="py-1.5 text-[11px] font-mono text-gray-400 w-[45%] align-top">{label}</td>
        <td className="py-1.5 text-[12px] font-medium text-gray-800">{displayVal}</td>
      </tr>
    )
  }

  const isoVal = type === 'date' && value
    ? value.split('/').reverse().join('-')
    : ''

  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-1 text-[11px] font-mono text-gray-400 w-[45%] align-middle">{label}</td>
      <td className="py-1">
        {type === 'select' ? (
          <select
            className={inputClass}
            defaultValue={value}
            onChange={e => onSave(e.target.value)}
          >
            {options.map(o => <option key={o}>{o}</option>)}
          </select>
        ) : type === 'date' ? (
          <input
            type="date"
            className={inputClass}
            defaultValue={isoVal}
            onChange={e => onSave(e.target.value ? e.target.value.split('-').reverse().join('/') : '')}
          />
        ) : type === 'textarea' ? (
          <textarea
            className={cn(inputClass, 'min-h-[48px] resize-y')}
            defaultValue={value}
            onBlur={e => onSave(e.target.value)}
          />
        ) : (
          <input
            type="text"
            className={inputClass}
            defaultValue={value}
            onBlur={e => onSave(e.target.value)}
          />
        )}
      </td>
    </tr>
  )
}

// ============================================================
// LOADING SKELETON
// ============================================================

export function TableSkeleton({ rows = 5, cols = 8 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-8 bg-surface-2 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// ============================================================
// SECTION HEADING (form)
// ============================================================

export function FormSectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-2 text-[10px] font-mono uppercase tracking-wider text-gray-400 pt-4 pb-2 border-b border-border mb-2">
      {children}
    </div>
  )
}

export function RequiredStar() {
  return <span className="text-[16px] text-red-600 font-medium ml-0.5 leading-none align-middle">*</span>
}
