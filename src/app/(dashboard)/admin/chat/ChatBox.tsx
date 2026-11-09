'use client'

import { useState, useTransition, useRef } from 'react'
import { sendChatMessage, uploadChatVoice } from '@/app/actions/notes'
import { useRouter } from 'next/navigation'

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
      const r = await sendChatMessage(fd)
      if (r && 'error' in r && r.error) {
        setVoiceStatus(r.error)
        return
      }
      setBody('')
      setVoiceStatus('')
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
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : ''
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data)
      }
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
        if (blob.size < 200) {
          setVoiceStatus('التسجيل قصير جدًا — اضغط مطولًا أكثر')
          return
        }
        setVoiceStatus('جاري رفع الرسالة الصوتية...')
        start(async () => {
          try {
            const fd = new FormData()
            fd.set('peer_id', peerId)
            fd.set('audio', new File([blob], `voice-${Date.now()}.webm`, { type: blob.type || 'audio/webm' }))
            const r = await uploadChatVoice(fd)
            if (r && 'error' in r && r.error) {
              setVoiceStatus('فشل الرفع: ' + r.error)
              return
            }
            setVoiceStatus('تم إرسال الصوت ✓')
            router.refresh()
          } catch (err: any) {
            setVoiceStatus(String(err?.message || err))
          }
        })
      }
      mediaRef.current = mr
      mr.start(250)
      setRecording(true)
      setVoiceStatus('جاري التسجيل... اضغط المايك مرة أخرى للإيقاف')
    } catch {
      setVoiceStatus('الميكروفون غير متاح — اسمح بالوصول من إعدادات المتصفح')
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
