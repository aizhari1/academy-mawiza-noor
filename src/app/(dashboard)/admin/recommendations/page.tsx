'use client'

import { useEffect, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Rec = {
  id: string
  type: 'book' | 'video' | 'course'
  title: string
  author: string | null
  description: string | null
  url: string | null
  image_url: string | null
  is_featured: boolean
  is_active: boolean
  sort_order: number
}

const TYPE_LABEL: Record<string, string> = {
  book: 'كتاب',
  video: 'فيديو',
  course: 'دورة',
}

const EMPTY = {
  type: 'book' as const,
  title: '',
  author: '',
  description: '',
  url: '',
  image_url: '',
  is_featured: false,
  is_active: true,
  sort_order: 0,
}

export default function RecommendationsAdminPage() {
  const [items, setItems] = useState<Rec[]>([])
  const [form, setForm] = useState({ ...EMPTY })
  const [editId, setEditId] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  function load() {
    createClient()
      .from('recommendations')
      .select('*')
      .order('sort_order')
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems((data as Rec[]) ?? []))
  }

  useEffect(() => { load() }, [])

  function set(k: string, v: string | boolean | number) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function startEdit(r: Rec) {
    setEditId(r.id)
    setForm({
      type: r.type,
      title: r.title,
      author: r.author || '',
      description: r.description || '',
      url: r.url || '',
      image_url: r.image_url || '',
      is_featured: r.is_featured,
      is_active: r.is_active,
      sort_order: r.sort_order,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function reset() {
    setEditId(null)
    setForm({ ...EMPTY })
  }

  function save() {
    if (!form.title.trim()) { setMsg('العنوان مطلوب'); return }
    setMsg('')
    startTransition(async () => {
      const supabase = createClient()
      const payload = {
        type: form.type,
        title: form.title.trim(),
        author: form.author.trim() || null,
        description: form.description.trim() || null,
        url: form.url.trim() || null,
        image_url: form.image_url.trim() || null,
        is_featured: form.is_featured,
        is_active: form.is_active,
        sort_order: Number(form.sort_order) || 0,
        updated_at: new Date().toISOString(),
      }
      if (editId) {
        const { error } = await supabase.from('recommendations').update(payload).eq('id', editId)
        if (error) setMsg(error.message)
        else { setMsg('تم التحديث'); reset(); load() }
      } else {
        const { error } = await supabase.from('recommendations').insert(payload)
        if (error) setMsg(error.message)
        else { setMsg('تم الإضافة'); reset(); load() }
      }
    })
  }

  function toggleActive(r: Rec) {
    startTransition(async () => {
      await createClient().from('recommendations').update({ is_active: !r.is_active }).eq('id', r.id)
      load()
    })
  }

  function remove(id: string) {
    if (!confirm('حذف هذا الترشيح؟')) return
    startTransition(async () => {
      await createClient().from('recommendations').delete().eq('id', id)
      load()
    })
  }

  return (
    <div className="min-h-dvh max-w-lg mx-auto pb-28" style={{ background: '#eefdf6' }}>
      <header className="px-4 py-3 flex items-center gap-3">
        <Link href="/admin" className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Link>
        <div>
          <h1 className="text-[16px] font-bold">ترشيحات الموقع</h1>
          <p className="text-[11px]" style={{ color: '#6f7974' }}>كتب · فيديوهات · دورات — تظهر في اللاندنج</p>
        </div>
      </header>

      <main className="px-4 space-y-4">
        <div className="card p-4 space-y-2">
          <p className="text-[13px] font-bold">{editId ? 'تعديل ترشيح' : 'إضافة ترشيح جديد'}</p>
          <select value={form.type} onChange={(e) => set('type', e.target.value)} className="input">
            <option value="book">كتاب</option>
            <option value="video">فيديو</option>
            <option value="course">دورة</option>
          </select>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="العنوان *" className="input" />
          <input value={form.author} onChange={(e) => set('author', e.target.value)} placeholder="المؤلف / المصدر" className="input" />
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="وصف قصير" className="input" rows={2} />
          <input value={form.url} onChange={(e) => set('url', e.target.value)} placeholder="رابط (يوتيوب / شراء / تسجيل)" className="input" dir="ltr" />
          <input value={form.image_url} onChange={(e) => set('image_url', e.target.value)} placeholder="رابط صورة (اختياري)" className="input" dir="ltr" />
          <div className="flex gap-3 text-[13px]">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} />
              مميّز
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
              ظاهر في الموقع
            </label>
          </div>
          <input type="number" value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} placeholder="ترتيب العرض" className="input" />
          {msg && <p className="text-[12px]" style={{ color: '#176b52' }}>{msg}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={save} disabled={isPending} className="btn-primary flex-1 py-2.5">
              {isPending ? 'جاري الحفظ...' : editId ? 'حفظ التعديل' : 'إضافة'}
            </button>
            {editId && (
              <button type="button" onClick={reset} className="px-4 py-2.5 rounded-xl bg-white border text-[13px]">إلغاء</button>
            )}
          </div>
        </div>

        <h2 className="text-[13px] font-bold">القائمة ({items.length})</h2>
        <div className="space-y-2">
          {items.map((r) => (
            <div key={r.id} className="card p-3.5 text-[13px]">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#e8f7f0', color: '#176b52' }}>
                    {TYPE_LABEL[r.type]}
                  </span>
                  {r.is_featured && <span className="text-[11px] mr-1" style={{ color: '#c5a45d' }}>★ مميّز</span>}
                  {!r.is_active && <span className="text-[11px] mr-1" style={{ color: '#ba1a1a' }}>مخفي</span>}
                  <p className="font-bold mt-1">{r.title}</p>
                  {r.author && <p className="text-[11px]" style={{ color: '#6f7974' }}>{r.author}</p>}
                  {r.description && <p className="text-[12px] mt-1" style={{ color: '#3f4944' }}>{r.description}</p>}
                </div>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <button type="button" onClick={() => startEdit(r)} className="text-[12px] font-semibold" style={{ color: '#176b52' }}>تعديل</button>
                <button type="button" onClick={() => toggleActive(r)} className="text-[12px] font-semibold" style={{ color: '#755b1b' }}>
                  {r.is_active ? 'إخفاء' : 'إظهار'}
                </button>
                <button type="button" onClick={() => remove(r.id)} className="text-[12px] font-semibold" style={{ color: '#ba1a1a' }}>حذف</button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="card p-6 text-center text-[13px]" style={{ color: '#6f7974' }}>لا ترشيحات بعد — أضف أول ترشيح أعلاه</p>
          )}
        </div>
      </main>
    </div>
  )
}
