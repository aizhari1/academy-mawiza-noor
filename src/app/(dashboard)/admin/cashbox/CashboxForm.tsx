'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function CashboxForm() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('رواتب')
  const [description, setDescription] = useState('')
  const [msg, setMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const amt = Number(amount)
    if (!amt || amt <= 0) {
      setMsg('أدخل مبلغاً صحيحاً')
      return
    }
    startTransition(async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { error } = await supabase.from('activity_log').insert({
        actor_id: user?.id,
        action: 'finance_expense',
        entity_type: 'finance',
        details: { amount: amt, category, description, entry_type: 'مصروف' },
      })
      if (error) setMsg(error.message)
      else {
        setMsg('تم تسجيل المصروف')
        setAmount('')
        setDescription('')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        type="number"
        min={1}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="المبلغ"
        className="w-full rounded-xl border px-3 py-2.5 text-[14px]"
        style={{ borderColor: '#e5efe8' }}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full rounded-xl border px-3 py-2.5 text-[14px] bg-white"
        style={{ borderColor: '#e5efe8' }}
      >
        <option value="رواتب">رواتب</option>
        <option value="إيجار">إيجار</option>
        <option value="إنترنت">إنترنت</option>
        <option value="مستلزمات">مستلزمات</option>
        <option value="أخرى">أخرى</option>
      </select>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="وصف / ملاحظات"
        className="w-full rounded-xl border px-3 py-2.5 text-[14px]"
        style={{ borderColor: '#e5efe8' }}
      />
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 rounded-xl text-white font-bold text-[13px] disabled:opacity-50"
        style={{ background: '#ba1a1a' }}
      >
        {isPending ? 'جاري التسجيل...' : 'تسجيل مصروف'}
      </button>
      {msg && (
        <p className="text-[12px] text-center font-bold" style={{ color: msg.includes('تم') ? '#176b52' : '#ba1a1a' }}>
          {msg}
        </p>
      )}
    </form>
  )
}
