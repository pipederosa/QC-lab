// src/lib/utils.ts
import type { Study, ScrumRecord } from '@/types'

// ============================================================
// DATE UTILITIES
// ============================================================

/** Parse dd/mm/yyyy → Date | null */
export function parseDate(str: string | undefined | null): Date | null {
  if (!str || str === 'N/A' || str === '—' || str === '') return null
  const parts = str.split('/')
  if (parts.length === 3) {
    const [d, m, y] = parts.map(Number)
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m - 1, d)
  }
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

/** Days left from today (negative = overdue) */
export function daysLeft(dateStr: string | undefined | null): number | null {
  const d = parseDate(dateStr)
  if (!d) return null
  return Math.round((d.getTime() - Date.now()) / 86_400_000)
}

/** ISO yyyy-mm-dd → dd/mm/yyyy */
export function isoToDMY(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/** dd/mm/yyyy → ISO yyyy-mm-dd (for <input type="date">) */
export function dmyToISO(dmy: string): string {
  if (!dmy) return ''
  const [d, m, y] = dmy.split('/')
  return `${y}-${m}-${d}`
}

/** Now as dd/mm/yyyy hh:mm */
export function nowStr(): string {
  const n = new Date()
  const pad = (v: number) => String(v).padStart(2, '0')
  return `${pad(n.getDate())}/${pad(n.getMonth() + 1)}/${n.getFullYear()} ${pad(n.getHours())}:${pad(n.getMinutes())}`
}

/** Date stamp for filenames */
export function dateStamp(): string {
  const n = new Date()
  const pad = (v: number) => String(v).padStart(2, '0')
  return `${n.getFullYear()}${pad(n.getMonth() + 1)}${pad(n.getDate())}`
}

// ============================================================
// STUDY STATUS HELPERS
// ============================================================

export function isStudyExpired(s: Study): boolean {
  const dl = daysLeft(s.limite)
  return dl !== null && dl < 0 && s.estado !== 'Completo' && s.estado !== 'Cancelado'
}

export function isStudyExpiringSoon(s: Study, days = 30): boolean {
  const dl = daysLeft(s.limite)
  return dl !== null && dl >= 0 && dl <= days && s.estado !== 'Completo' && s.estado !== 'Cancelado'
}

// ============================================================
// SORT UTILITY
// ============================================================

// SORT UTILITY
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function compareVal(a: any, b: any, col: string): number {
  const av = String(a[col] ?? '')
  const bv = String(b[col] ?? '')
  const ad = parseDate(av)
  const bd = parseDate(bv)
  if (ad && bd) return ad.getTime() - bd.getTime()
  return av.localeCompare(bv, undefined, { numeric: true })
}

// ============================================================
// EXPORT
// ============================================================

export function csvDownload(rows: (string | number)[][], filename: string): void {
  const csv = rows
    .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, filename + '.csv')
}

export function xlsxDownload(
  headers: string[],
  rows: (string | number)[][],
  sheetName: string,
  filename: string
): void {
  // Dynamic import to avoid SSR issues
  import('xlsx').then(XLSX => {
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
    ws['!cols'] = headers.map((h, i) => ({
      wch: Math.min(Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length)) + 2, 40),
    }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    XLSX.writeFile(wb, filename + '.xlsx')
  })
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ============================================================
// CN (class merge helper, replaces clsx for simple cases)
// ============================================================
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
