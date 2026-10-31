import { createBrowserClient } from '@supabase/ssr'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plcynebifuyklfakzjyp.supabase.co'
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_q1Vwrqpk0VzVLKOW0R_8IA_lUNwoTvr'

export function createClient() {
  return createBrowserClient(URL, KEY)
}
