import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const actionLabel: Record<string, string> = {
  add_student: 'إضافة طالب',
  admin_teacher_eval: 'تقييم الإدارة لمعلم',
  change_status: 'تغيير حالة طالب',
  chat_message: 'رسالة شات',
  contact_status: 'تحديث حالة تواصل',
  create_student: 'إضافة طالب',
  delete_attendance_settle: 'حذف حضور مع تسوية',
  delete_payment: 'حذف دفعة',
  deleted_session: 'حذف حصة',
  finance_expense: 'مصروف من الصندوق',
  login: 'تسجيل دخول',
  logout: 'تسجيل خروج',
  month_archive: 'أرشفة شهر',
  note: 'ملاحظة',
  parent_evaluation: 'تقييم ولي أمر',
  payment_reminder: 'تذكير مالي',
  record_payment: 'تسجيل دفعة',
  session_num: 'تعديل رقم حصة',
  session_report: 'تسجيل حضور / تقرير حصة',
  student_status: 'تغيير حالة طالب',
  student_update: 'تعديل بيانات طالب',
  supervisor_edit_student: 'تعديل طالب (مشرف)',
  supervisor_eval: 'تقييم مشرف',
  supervisor_pay: 'تسجيل دفع (مشرف)',
  supervisor_payment: 'تسجيل دفع (مشرف)',
  teacher_absence: 'غياب معلم',
  teacher_delete_session: 'حذف حصة (معلم)',
  teacher_note: 'ملاحظة معلم',
  teacher_session_rate: 'تعديل سعر حصة معلم',
  teacher_settlement: 'صرف راتب معلم',
  transfer_student: 'نقل طالب لمعلم',
  trial_add: 'إضافة طالب تجريبي',
  trial_report: 'تقرير حصة تجريبية',
  whatsapp_report: 'إرسال تقرير واتساب',
  reduce_session_remove_admin_only: 'حذف حصة تسوية إدارية',
  align_counter: 'مطابقة عدّاد مع آخر حصة',
  set_last_session: 'ضبط رقم آخر حصة',
}

const fieldLabel: Record<string, string> = {
  name: 'الاسم',
  code: 'الكود',
  amount: 'المبلغ',
  method: 'طريقة الدفع',
  notes: 'ملاحظات',
  student_id: 'الطالب',
  payment_date: 'تاريخ الدفع',
  prepaid_months: 'أشهر مقدّمة',
  due_after: 'الاستحقاق بعد',
  due_before: 'الاستحقاق قبل',
  session_num: 'رقم الحصة',
  date: 'التاريخ',
  status: 'الحالة',
  package_size: 'حجم الباقة',
  attendance_id: 'الحضور',
  package_complete: 'اكتمال الباقة',
  package_id: 'الباقة',
  teacher_id: 'المعلم',
  last_session_num: 'آخر رقم حصة',
  price_per_session: 'سعر الحصة',
  teacher_session_rate: 'سعر حصة المعلم',
  report: 'التقرير',
  evaluation: 'التقييم',
  homework: 'الواجب',
  from: 'من',
  to: 'إلى',
  month: 'الشهر',
  year: 'السنة',
  title: 'العنوان',
  reason: 'السبب',
  category: 'التصنيف',
  student_name: 'الطالب',
  teacher_name: 'المعلم',
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isUuid(v: unknown): boolean {
  return typeof v === 'string' && UUID_RE.test(v.trim())
}

function fmtValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? 'نعم' : 'لا'
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>
    if ('name' in o && o.name != null) return String(o.name)
    if ('to' in o && 'from' in o) return `${fmtValue(o.from)} ← ${fmtValue(o.to)}`
    if ('to' in o) return String(o.to)
    return '—'
  }
  const s = String(v)
  if (isUuid(s)) return '—'
  if (s === 'حاضر' || s === 'present') return 'حاضر'
  if (s === 'غائب' || s === 'absent') return 'غائب'
  if (s === 'active') return 'نشط'
  if (s === 'inactive' || s === 'stopped') return 'متوقف'
  if (s === 'paused') return 'موقوف مؤقتاً'
  return s
}

function formatDetails(details: unknown): string[] {
  if (!details || typeof details !== 'object') return []
  const d = details as Record<string, unknown>
  const lines: string[] = []
  const preferred = [
    'name', 'code', 'student_name', 'teacher_name', 'status', 'session_num', 'date',
    'amount', 'method', 'notes', 'price_per_session', 'teacher_session_rate',
    'last_session_num', 'package_size', 'package_complete', 'teacher_id',
    'evaluation', 'homework', 'report', 'title', 'month', 'year', 'reason', 'category',
  ]
  const seen = new Set<string>()
  for (const k of preferred) {
    if (!(k in d)) continue
    seen.add(k)
    lines.push(`${fieldLabel[k] || k}: ${fmtValue(d[k])}`)
  }
  for (const [k, v] of Object.entries(d)) {
    if (seen.has(k)) continue
    if (isUuid(v)) continue
    if ((k.endsWith('_id') || k === 'attendance_id') && lines.length > 0) continue
    lines.push(`${fieldLabel[k] || k}: ${fmtValue(v)}`)
  }
  return lines
}

export default async function ActivityLogPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: logs } = await supabase
    .from('activity_log')
    .select('id, action, entity_id, details, created_at, user_id')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div className="min-h-dvh max-w-lg mx-auto pb-24" style={{ background: '#eefdf6' }}>
      <header className="px-4 py-3 flex items-center gap-3">
        <Link href="/admin" className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Link>
        <div>
          <h1 className="text-[16px] font-bold" style={{ color: '#00513c' }}>
            سجل النشاط
          </h1>
          <p className="text-[11px]" style={{ color: '#6f7974' }}>
            {logs?.length ?? 0} حدث · آخر 200
          </p>
        </div>
      </header>

      <div className="px-4 space-y-2">
        {(logs ?? []).map((l) => {
          const lines = formatDetails(l.details)
          return (
            <div key={l.id} className="card p-3">
              <div className="flex justify-between gap-2 items-start">
                <p className="text-[13px] font-bold" style={{ color: '#00513c' }}>
                  {actionLabel[l.action] || l.action}
                </p>
                <p className="text-[10px] shrink-0" style={{ color: '#6f7974' }}>
                  {l.created_at ? new Date(l.created_at).toLocaleString('ar-EG') : '—'}
                </p>
              </div>
              {lines.length > 0 ? (
                <ul className="mt-1.5 space-y-0.5">
                  {lines.map((line) => (
                    <li key={line} className="text-[11px] leading-relaxed" style={{ color: '#3f4944' }}>
                      {line}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] mt-1" style={{ color: '#6f7974' }}>
                  —
                </p>
              )}
            </div>
          )
        })}
        {(logs ?? []).length === 0 && (
          <p className="text-center text-[13px] py-8" style={{ color: '#6f7974' }}>
            لا أحداث بعد
          </p>
        )}
      </div>
    </div>
  )
}
