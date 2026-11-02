export const PAYMENT_METHODS = [
  { id: 'انستا_باي', label: 'إنستا باي' },
  { id: 'فودافون_كاش', label: 'فودافون كاش' },
  { id: 'تحويل_بنكي', label: 'تحويل بنكي' },
  { id: 'كاش', label: 'كاش' },
  { id: 'اخرى', label: 'أخرى' },
] as const

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]['id']

export function methodLabel(method: string | null | undefined): string {
  if (!method) return '—'
  const found = PAYMENT_METHODS.find((m) => m.id === method || m.label === method)
  if (found) return found.label
  const n = String(method).toLowerCase()
  if (n.includes('insta') || n.includes('انستا')) return 'إنستا باي'
  if (n.includes('vodafone') || n.includes('فودافون')) return 'فودافون كاش'
  if (n.includes('bank') || n.includes('بنك') || n.includes('تحويل')) return 'تحويل بنكي'
  if (n.includes('cash') || n.includes('كاش') || n.includes('نقد')) return 'كاش'
  return method
}

export function normalizeMethod(method: string | null | undefined): string {
  if (!method) return 'اخرى'
  const found = PAYMENT_METHODS.find((m) => m.id === method || m.label === method)
  if (found) return found.id
  const n = String(method).toLowerCase()
  if (n.includes('insta') || n.includes('انستا')) return 'انستا_باي'
  if (n.includes('vodafone') || n.includes('فودافون')) return 'فودافون_كاش'
  if (n.includes('bank') || n.includes('بنك') || n.includes('تحويل')) return 'تحويل_بنكي'
  if (n.includes('cash') || n.includes('كاش') || n.includes('نقد')) return 'كاش'
  return 'اخرى'
}

export function methodColor(method: string | null | undefined): string {
  const id = normalizeMethod(method)
  if (id === 'انستا_باي') return '#7c3aed'
  if (id === 'فودافون_كاش') return '#e11d48'
  if (id === 'تحويل_بنكي') return '#0369a1'
  if (id === 'كاش') return '#176b52'
  return '#6f7974'
}
