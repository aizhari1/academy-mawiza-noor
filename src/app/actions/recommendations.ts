'use server'

import { createClient } from '@/lib/supabase/server'

export type Recommendation = {
  id: string
  type: 'book' | 'video' | 'course'
  title: string
  author: string | null
  description: string | null
  url: string | null
  image_url: string | null
  is_featured: boolean
  sort_order: number
}

export async function getActiveRecommendations(): Promise<Recommendation[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('recommendations')
      .select('id, type, title, author, description, url, image_url, is_featured, sort_order')
      .eq('is_active', true)
      .order('sort_order')
      .order('created_at', { ascending: false })
    return (data as Recommendation[]) ?? []
  } catch {
    return []
  }
}
