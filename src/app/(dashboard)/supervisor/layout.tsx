import RoutePrefetch from '@/components/RoutePrefetch'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RoutePrefetch routes={['/supervisor', '/supervisor/payment', '/supervisor/status', '/admin/students', '/admin/finance']} />
      {children}
    </>
  )
}
