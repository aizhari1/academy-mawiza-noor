'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton({ className, label = 'تسجيل الخروج' }: { className?: string; label?: string }) {
  const router = useRouter()

  async function logout() {
    try {
      document.cookie = 'mawiza_role=; path=/; max-age=0'
      document.cookie = 'ashbal_role=; path=/; max-age=0'
    } catch {}
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <button type="button" onClick={logout} className={className}>
      {label}
    </button>
  )
}

export default LogoutButton
