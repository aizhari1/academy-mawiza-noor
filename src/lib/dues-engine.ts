/**
 * مصدر واحد لحساب المستحقات (Backend فقط).
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  computeDueReminders,
  type LastPay,
  type ReminderRow,
  type ReminderStudent,
} from './reminder-logic'
import { monthBounds, resolveMonthKey, currentMonthKey } from './dues'
import { isPrepaidCoveringMonth } from './prepaid'

const PAGE = 1000
const STUDENT_COLS =
  'id, code, name, phone, status, subscription_type, monthly_sessions, amount_due, last_session_num, last_session_date, price_per_session, prepaid_until, teachers(name)'

type PageResult<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>

export async function fetchAll<T>(build: (from: number, to: number) => PageResult<T>): Promise<T[]> {
  const out: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1)
    if (error) throw new Error(error.message)
    const rows = data ?? []
    out.push(...rows)
    if (rows.length < PAGE) break
  }
  return out
}

export function buildLastPay(
  pays: {
    student_id: string | null
    payment_date: string | null
    due_after?: number | null
    prepaid_months?: number | null
    created_at?: string | null
  }[]
): Record<string, LastPay> {
  const sorted = [...pays].sort((a, b) => {
    const da = String(a.payment_date || '').slice(0, 10)
    const db = String(b.payment_date || '').slice(0, 10)
    if (da !== db) return da < db ? 1 : -1
    const ca = String(a.created_at || '')
    const cb = String(b.created_at || '')
    return ca < cb ? 1 : ca > cb ? -1 : 0
  })
  const lastPay: Record<string, LastPay> = {}
  for (const p of sorted) {
    if (!p.student_id || !p.payment_date) continue
    if (lastPay[p.student_id]) continue
    lastPay[p.student_id] = {
      day: String(p.payment_date).slice(0, 10),
      months: Math.max(1, Math.floor(Number(p.prepaid_months) || 1)),
      residual: Number(p.due_after) > 0 ? Number(p.due_after) : 0,
    }
  }
  return lastPay
}

export function buildAttendanceDays(
  att: { student_id: string | null; session_date: string | null }[]
): Record<string, string[]> {
  const attDays: Record<string, string[]> = {}
  const seen: Record<string, true> = {}
  for (const a of att) {
    if (!a.student_id || !a.session_date) continue
    const day = String(a.session_date).slice(0, 10)
    const k = a.student_id + '|' + day
    if (seen[k]) continue
    seen[k] = true
    ;(attDays[a.student_id] = attDays[a.student_id] || []).push(day)
  }
  return attDays
}

export type DuesInputs = {
  students: ReminderStudent[]
  lastPay: Record<string, LastPay>
  attDays: Record<string, string[]>
}

export async function loadDuesInputs(supabase: SupabaseClient): Promise<DuesInputs> {
  const students = await fetchAll<any>((from, to) =>
    supabase.from('students').select(STUDENT_COLS).order('id').range(from, to)
  )
  const pays = await fetchAll<any>((from, to) =>
    supabase
      .from('payments')
      .select('student_id, payment_date, due_after, prepaid_months, created_at')
      .order('payment_date', { ascending: false })
      .range(from, to)
  )
  const att = await fetchAll<any>((from, to) =>
    supabase
      .from('attendance')
      .select('student_id, session_date')
      .in('status', ['حاضر', 'متأخر'])
      .order('session_date')
      .range(from, to)
  )
  return {
    students: students as ReminderStudent[],
    lastPay: buildLastPay(pays),
    attDays: buildAttendanceDays(att),
  }
}

export async function computeAndSyncDues(supabase: SupabaseClient) {
  const inputs = await loadDuesInputs(supabase)
  const dueList = computeDueReminders(inputs.students, inputs.lastPay, inputs.attDays)
  return {
    total: dueList.reduce((s, r) => s + r.outstanding, 0),
    count: dueList.length,
    dueList,
  }
}

export type DuesSummary = {
  monthKey: string
  collected: number
  paymentsCount: number
  dueTotal: number
  dueCount: number
  topDues: { id: string; name: string; code: string; amount_due: number; phone: string | null }[]
}

export async function getDuesSummary(
  supabase: SupabaseClient,
  month?: string | null
): Promise<DuesSummary> {
  const monthKey = resolveMonthKey(month)
  const empty: DuesSummary = {
    monthKey,
    collected: 0,
    paymentsCount: 0,
    dueTotal: 0,
    dueCount: 0,
    topDues: [],
  }

  try {
    const { start, end } = monthBounds(monthKey)
    let payments: { amount: number }[] = []
    try {
      payments = await fetchAll<{ amount: number }>((from, to) =>
        supabase
          .from('payments')
          .select('amount')
          .gte('payment_date', start)
          .lte('payment_date', end)
          .order('payment_date')
          .order('id')
          .range(from, to)
      )
    } catch {
      payments = []
    }
    const collected = payments.reduce((s, p) => s + Number(p.amount || 0), 0)

    try {
      const dues = await computeAndSyncDues(supabase)
      return {
        monthKey,
        collected,
        paymentsCount: payments.length,
        dueTotal: dues.total,
        dueCount: dues.count,
        topDues: [...dues.dueList]
          .sort((a, b) => b.outstanding - a.outstanding)
          .slice(0, 8)
          .map((r) => ({
            id: r.id,
            name: r.name,
            code: r.code,
            amount_due: r.outstanding,
            phone: r.phone,
          })),
      }
    } catch {
      return { ...empty, collected, paymentsCount: payments.length }
    }
  } catch {
    return empty
  }
}

export { currentMonthKey }
