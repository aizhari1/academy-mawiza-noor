/** روابط واتساب للتذكير */
export function waLink(phone: string | null | undefined, text: string): string {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!digits) return ''
  let n = digits
  if (n.startsWith('0')) n = '20' + n.slice(1)
  if (!n.startsWith('20') && n.length === 10) n = '20' + n
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`
}
