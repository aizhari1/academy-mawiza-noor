/** تنسيق الوقت */
export function toTimeLabel(t: string | null | undefined): string {
  if (!t) return '—'
  return String(t).slice(0, 5)
}

export function todayKeyCairo(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' })
}
