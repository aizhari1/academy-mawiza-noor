'use client'

import { useState, useTransition, useRef } from 'react'
import { sendChatMessage } from '@/app/actions/notes'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ChatBox({ peerId }: { peerId: string }) {
  const [body, setBody] = useState('')
  const [pending, start] = useTransition()
  const [recording, setRecording] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState('')
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const router = useRouter()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    start(async () => {
      const fd = new FormData()
      fd.set('body', body)
      fd.set('peer_id', peerId)
      await sendChatMessage(fd)
      setBody('')
      router.refresh()
    })
  }

  async function toggleRecord() {
    if (recording && mediaRef.current) {
      mediaRef.current.stop()
      setRecording(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data)
      }
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (blob.size < 500) {
          setVoiceStatus('التسجيل قصير جدًا')
          return
        }
        setVoiceStatus('جاري رفع الرسالة الصوتية...')
        start(async () => {
          try {
            const supabase = createClient()
            const path = `chat/${peerId}/${Date.now()}.webm`
            try {
              await supabase.storage.createBucket('chat-voice', { public: true })
            } catch {
              /* exists */
            }
            const { error } = await supabase.storage.from('chat-voice').upload(path, blob, {
              contentType: 'audio/webm',
              upsert: false,
            })
            if (error) {
              setVoiceStatus('فشل الرفع: ' + error.message)
              return
            }
            const { data } = supabase.storage.from('chat-voice').getPublicUrl(path)
            const url = data?.publicUrl
            if (!url) {
              setVoiceStatus('تعذر الحصول على الرابط')
              return
            }
            const fd = new FormData()
            fd.set('body', `🎤 رسالة صوتية\n${url}`)
            fd.set('peer_id', peerId)
            await sendChatMessage(fd)
            setVoiceStatus('تم إرسال الصوت ✓')
            router.refresh()
          } catch (err: any) {
            setVoiceStatus(String(err?.message || err))
          }
        })
      }
      mediaRef.current = mr
      mr.start()
      setRecording(true)
      setVoiceStatus('جاري التسجيل... اضغط مرة أخرى للإيقاف')
    } catch {
      setVoiceStatus('الميكروفون غير متاح — اسمح بالوصول')
    }
  }

  return (
    <div className="space-y-2">
      {voiceStatus && (
        <p className="text-[11px] text-center font-semibold" style={{ color: recording ? '#ba1a1a' : '#176b52' }}>
          {voiceStatus}
        </p>
      )}
      <form onSubmit={submit} className="flex gap-2 items-end">
        <button
          type="button"
          onClick={toggleRecord}
          disabled={pending}
          className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center"
          style={{
            background: recording ? '#ba1a1a' : '#e8f5ef',
            color: recording ? '#fff' : '#176b52',
          }}
          title="رسالة صوتية"
        >
          <span className="material-symbols-outlined text-[22px]">{recording ? 'stop' : 'mic'}</span>
        </button>
        <textarea
          className="input flex-1 text-[14px] min-h-[44px] max-h-[100px] py-2"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="اكتب رسالة..."
          rows={1}
        />
        <button type="submit" disabled={pending} className="btn-primary px-4 py-2.5 text-[13px] shrink-0">
          إرسال
        </button>
      </form>
    </div>
  )
}
