import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://plcynebifuyklfakzjyp.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_q1Vwrqpk0VzVLKOW0R_8IA_lUNwoTvr'

  const pathname = request.nextUrl.pathname
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/evaluate') ||
    pathname.startsWith('/student') ||
    pathname.startsWith('/portal') ||
    pathname.startsWith('/api/student-portal')

  const redirectTo = (path: string) => {
    if (pathname === path) return null
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = path
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    const userPromise = supabase.auth.getUser()
    const timeout = new Promise<{ data: { user: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null } }), 2500)
    )
    const { data: { user } } = await Promise.race([userPromise, timeout]) as any

    if (!user && !isPublic) {
      return redirectTo('/login') || supabaseResponse
    }

    if (user && !isPublic) {
      let role = ''
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        role = String(profile?.role || '')
      } catch {
        role = ''
      }

      // بدون role في profiles: نسمح بالوصول ونمنع حلقة إعادة التوجيه
      if (!role) {
        return supabaseResponse
      }

      const homeForRole = (r: string) => {
        if (r === 'teacher') return '/teacher'
        if (r === 'supervisor') return '/supervisor'
        if (r === 'parent') return '/parent'
        if (r === 'admin') return '/admin'
        return '/portal'
      }

      if (pathname.startsWith('/admin')) {
        const supervisorAllowed =
          pathname.startsWith('/admin/notes') ||
          pathname.startsWith('/admin/students') ||
          pathname.startsWith('/admin/finance') ||
          pathname.startsWith('/admin/fixed-schedule') ||
          pathname.startsWith('/admin/schedule') ||
          pathname.startsWith('/admin/subscriptions-log') ||
          pathname.startsWith('/admin/transfer') ||
          pathname.startsWith('/admin/supervisor-eval') ||
          pathname.startsWith('/admin/evaluations') ||
          pathname.startsWith('/admin/reports') ||
          pathname.startsWith('/admin/families') ||
          pathname.startsWith('/admin/chat')

        if (role === 'admin') {
          // ok
        } else if (role === 'supervisor' && supervisorAllowed) {
          // ok
        } else {
          const dest = homeForRole(role)
          const r = redirectTo(dest)
          if (r) return r
        }
      }

      if (pathname.startsWith('/teacher')) {
        if (role !== 'teacher' && role !== 'admin') {
          const r = redirectTo(homeForRole(role))
          if (r) return r
        }
      }

      if (pathname.startsWith('/supervisor')) {
        if (role !== 'supervisor' && role !== 'admin') {
          const r = redirectTo(homeForRole(role))
          if (r) return r
        }
      }

      if (role === 'teacher' && pathname.startsWith('/admin')) {
        const r = redirectTo('/teacher')
        if (r) return r
      }

      if (
        role === 'supervisor' &&
        (pathname.startsWith('/admin/monthly') ||
          pathname.startsWith('/admin/analytics') ||
          pathname.startsWith('/admin/cashbox') ||
          pathname.startsWith('/admin/users') ||
          pathname.startsWith('/admin/payroll') ||
          pathname === '/admin')
      ) {
        const r = redirectTo('/supervisor')
        if (r) return r
      }
    }
  } catch {
    return NextResponse.next({ request })
  }

  return supabaseResponse
}
