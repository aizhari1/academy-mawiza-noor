'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RoutePrefetch({ routes }: { routes: string[] }) {
  const router = useRouter()
  useEffect(() => {
    routes.forEach((r) => {
      try {
        router.prefetch(r)
      } catch {
        /* ignore */
      }
    })
  }, [router, routes])
  return null
}
