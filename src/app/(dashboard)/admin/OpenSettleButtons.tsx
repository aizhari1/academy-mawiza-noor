'use client'

import Link from 'next/link'

export function OpenSettleButtons() {
  return (
    <div className="flex gap-2">
      <Link
        href="/admin/session-settle"
        className="flex-1 text-center py-2.5 rounded-xl text-white text-[13px] font-bold"
        style={{ background: '#176b52' }}
      >
        تسوية حصة
      </Link>
      <Link
        href="/admin/attended"
        className="flex-1 text-center py-2.5 rounded-xl text-[13px] font-bold bg-white"
        style={{ color: '#176b52', border: '1px solid #cde8dc' }}
      >
        الحضور
      </Link>
    </div>
  )
}
