'use server'

import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function addNote(formData: FormData) {
  const body = String(formData.get('body') || '').trim()
  if (!body) return { error: 'اكتب الملاحظة' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  const { data: profile } = await supabase.from('profiles').select('full_name, role, code').eq('id', user.id).single()

  const target = String(formData.get('target') || 'admin')
  const teacherId = String(formData.get('teacher_id') || '') || null

  await supabase.from('activity_log').insert({
    actor_id: user.id,
    action: 'note',
    entity_type: teacherId ? 'teacher' : 'admin',
    entity_id: teacherId || user.id,
    details: {
      body,
      target,
      from_name: profile?.full_name || '',
      from_role: profile?.role || '',
      from_code: profile?.code || '',
      at: new Date().toISOString(),
    },
  })

  revalidatePath('/admin/notes')
  revalidatePath('/admin/chat')
  revalidatePath('/teacher')
  revalidatePath('/supervisor')
  revalidatePath('/supervisor/chat')
  return { success: true }
}

export async function sendChatMessage(formData: FormData) {
  const body = String(formData.get('body') || '').trim()
  const peerId = String(formData.get('peer_id') || '').trim()
  if (!body) return { error: 'اكتب رسالة' }
  if (!peerId) return { error: 'اختر الطرف' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  const { data: profile } = await supabase.from('profiles').select('full_name, role, code').eq('id', user.id).single()

  const a = user.id
  const b = peerId
  const thread = [a, b].sort().join(':')

  await supabase.from('activity_log').insert({
    actor_id: user.id,
    action: 'chat_message',
    entity_type: 'chat',
    entity_id: thread,
    details: {
      body,
      from_id: user.id,
      to_id: peerId,
      from_name: profile?.full_name || '',
      from_role: profile?.role || '',
      thread,
      at: new Date().toISOString(),
    },
  })

  revalidatePath('/admin/chat')
  revalidatePath('/teacher/chat')
  revalidatePath('/supervisor/chat')
  return { success: true }
}

/** رفع رسالة صوتية عبر service role (يتجاوز RLS على Storage) */
export async function uploadChatVoice(formData: FormData) {
  const peerId = String(formData.get('peer_id') || '').trim()
  const file = formData.get('audio')
  if (!peerId) return { error: 'اختر الطرف' }
  if (!(file instanceof File) || file.size < 200) return { error: 'التسجيل قصير أو فارغ' }
  if (file.size > 8 * 1024 * 1024) return { error: 'الملف كبير (الحد 8 ميجا)' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'غير مصرح' }

  const { data: profile } = await supabase.from('profiles').select('full_name, role, code').eq('id', user.id).single()
  if (!profile || !['admin', 'supervisor', 'teacher'].includes(String(profile.role))) {
    return { error: 'غير مصرح بالشات' }
  }

  let svc
  try {
    svc = serviceClient()
  } catch {
    return { error: 'مفتاح السيرفر غير مضبوط — تواصل مع المطور' }
  }

  // تأكد من وجود الـ bucket
  try {
    await svc.storage.createBucket('chat-voice', { public: true, fileSizeLimit: 8 * 1024 * 1024 })
  } catch {
    /* موجود */
  }

  const ext = (file.name.split('.').pop() || 'webm').toLowerCase().replace(/[^a-z0-9]/g, '') || 'webm'
  const path = `${user.id}/${peerId}/${Date.now()}.${ext}`
  const buf = Buffer.from(await file.arrayBuffer())
  const contentType = file.type || 'audio/webm'

  const { error: upErr } = await svc.storage.from('chat-voice').upload(path, buf, {
    contentType,
    upsert: false,
  })
  if (upErr) return { error: `فشل الرفع: ${upErr.message}` }

  const { data: pub } = svc.storage.from('chat-voice').getPublicUrl(path)
  const url = pub?.publicUrl
  if (!url) return { error: 'تعذر الحصول على رابط الصوت' }

  const thread = [user.id, peerId].sort().join(':')
  await supabase.from('activity_log').insert({
    actor_id: user.id,
    action: 'chat_message',
    entity_type: 'chat',
    entity_id: thread,
    details: {
      body: `🎤 رسالة صوتية\n${url}`,
      from_id: user.id,
      to_id: peerId,
      from_name: profile.full_name || '',
      from_role: profile.role || '',
      thread,
      voice_url: url,
      at: new Date().toISOString(),
    },
  })

  revalidatePath('/admin/chat')
  revalidatePath('/teacher/chat')
  revalidatePath('/supervisor/chat')
  return { success: true, url }
}
