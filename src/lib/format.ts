/** تنسيق أرقام وتواريخ للعرض */
export function formatMoney(n: number | null | undefined, currency = 'ج'): string {
  const v = Number(n || 0)
  return `${v.toLocaleString('ar-EG')} ${currency}`
}

export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return '—'
  const s = typeof d === 'string' ? d.slice(0, 10) : d.toISOString().slice(0, 10)
  return s
}

export function formatPercent(n: number | null | undefined): string {
  return `${Number(n || 0).toFixed(0)}%`
}
