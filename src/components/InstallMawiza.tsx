'use client'

import { useEffect, useState } from 'react'
import { BRAND_ICON_192, BRAND_NAME } from '@/lib/brand-logo'

type BIPEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const INSTALLED_KEY = 'mawiza_pwa_installed'
const DISMISSED_KEY = 'mawiza_install_dismissed'

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    // @ts-expect-error iOS Safari
    window.navigator.standalone === true
  )
}

function markInstalled() {
  try {
    localStorage.setItem(INSTALLED_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function InstallMawiza() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [gone, setGone] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    if (isStandalone() || localStorage.getItem(INSTALLED_KEY) === '1') {
      markInstalled()
      setGone(true)
      setVisible(false)
      return
    }

    if (localStorage.getItem(DISMISSED_KEY) === '1') {
      setGone(true)
      return
    }

    setGone(false)

    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
      setVisible(true)
    }

    const onInstalled = () => {
      markInstalled()
      setGone(true)
      setVisible(false)
      setDeferred(null)
    }

    window.addEventListener('beforeinstallprompt', onBIP)
    window.addEventListener('appinstalled', onInstalled)

    const mobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent)
    let t: ReturnType<typeof setTimeout> | undefined
    if (mobile) {
      t = setTimeout(() => setVisible(true), 600)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('appinstalled', onInstalled)
      if (t) clearTimeout(t)
    }
  }, [])

  async function install() {
    if (deferred) {
      try {
        await deferred.prompt()
        const choice = await deferred.userChoice
        if (choice.outcome === 'accepted') {
          markInstalled()
          setGone(true)
          setVisible(false)
        } else {
          try {
            localStorage.setItem(DISMISSED_KEY, '1')
          } catch {
            /* ignore */
          }
          setGone(true)
          setVisible(false)
        }
      } catch {
        /* ignore */
      }
      setDeferred(null)
      return
    }

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    if (isIOS) {
      alert('للتثبيت على آيفون:\n1) زر المشاركة ⎙\n2) «إضافة إلى الشاشة الرئيسية»\n3) إضافة')
      try {
        localStorage.setItem(DISMISSED_KEY, '1')
      } catch {
        /* ignore */
      }
      setVisible(false)
      setGone(true)
      return
    }

    alert('للتثبيت:\nمن قائمة المتصفح ⋮ اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».')
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      /* ignore */
    }
    setVisible(false)
    setGone(true)
  }

  function dismiss() {
    setVisible(false)
    setGone(true)
    try {
      localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  if (gone || !visible) return null

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[9999] p-3 install-banner"
      style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
    >
      <div className="install-banner-inner mx-auto max-w-md rounded-2xl shadow-2xl flex items-center gap-3 p-3">
        <img
          src={BRAND_ICON_192}
          alt={BRAND_NAME}
          width={48}
          height={48}
          className="rounded-xl object-contain flex-shrink-0"
          style={{ width: 48, height: 48, background: '#000' }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] leading-tight">تثبيت {BRAND_NAME}</p>
          <p className="text-[11px] opacity-90 leading-snug mt-0.5">مرة واحدة — للوصول السريع كتطبيق</p>
        </div>
        <button
          type="button"
          onClick={install}
          className="install-banner-btn flex-shrink-0 rounded-xl px-3 py-2 text-[13px] font-bold"
        >
          تثبيت
        </button>
        <button type="button" onClick={dismiss} className="flex-shrink-0 text-[18px] opacity-70 px-1" aria-label="إغلاق">
          ×
        </button>
      </div>
    </div>
  )
}
