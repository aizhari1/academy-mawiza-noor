import RoutePrefetch from '@/components/RoutePrefetch'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RoutePrefetch routes={['/teacher', '/teacher/session', '/teacher/attendance', '/teacher/chat']} />
      {children}
    </>
  )
}
