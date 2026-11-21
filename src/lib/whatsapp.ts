export function normalizePhone(phone: string | null | undefined): string {
  let p = String(phone || '').replace(/[^\d+]/g, '')
  if (!p) return ''
  if (p.startsWith('00')) p = p.slice(2)
  if (p.startsWith('+')) p = p.slice(1)
  if (p.startsWith('0') && p.length >= 10) p = '20' + p.slice(1)
  else if (!p.startsWith('20') && p.length <= 11) p = '20' + p
  return p.length >= 11 && p.length <= 15 ? p : ''
}

export function waLink(phone: string | null | undefined, text: string) {
  const p = normalizePhone(phone)
  return p ? `https://wa.me/${p}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`
}
