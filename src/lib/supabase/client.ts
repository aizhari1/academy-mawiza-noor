import { createBrowserClient } from '@supabase/ssr'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://piozgpqznyclihxxsufj.supabase.co'
const KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_RI0oKv_w26IzocHkJmrWiw_cvaSQeW0'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

/** عميل واحد للجلسة — يحفظ الدخول في الكوكي ويتجنب إعادة الإنشاء */
export function createClient() {
  if (typeof window !== 'undefined' && browserClient) {
    return browserClient
  }
  const client = createBrowserClient(URL, KEY, {
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    },
    isSingleton: true,
  } as any)
  if (typeof window !== 'undefined') {
    browserClient = client
  }
  return client
}
