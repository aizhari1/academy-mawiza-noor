'use server'

import { createClient } from '@/lib/supabase/server'

/** تأكد أن حساب المعلم مربوط بصف في جدول teachers */
export async function ensureTeacherLinked() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  const { data: profile } = await supabase.from('profiles').select('id, role, full_name, code').eq('id', user.id).single()
  if (!profile || profile.role !== 'teacher') return { ok: true }

  const { data: existing } = await supabase.from('teachers').select('id').eq('profile_id', user.id).maybeSingle()
  if (existing) return { ok: true, teacher_id: existing.id }

  return { error: 'لا يوجد ملف معلم مرتبط — تواصل مع الإدارة' }
}
