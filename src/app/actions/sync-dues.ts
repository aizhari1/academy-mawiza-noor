'use server'

import { createClient } from '@/lib/supabase/server'

/** مزامنة amount_due من آخر حالة معروفة — تُستدعى عند فتح المالية */
export async function syncDuesSnapshot() {
  try {
    const supabase = await createClient()
    // لا تغيير جذري — الاعتماد على amount_due المخزّن بعد كل دفعة
    const { count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .gt('amount_due', 0)
    return { ok: true, withDues: count ?? 0 }
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) }
  }
}
