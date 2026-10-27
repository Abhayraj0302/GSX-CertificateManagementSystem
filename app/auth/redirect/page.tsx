'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

export default function AuthRedirectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    } else if (status === 'authenticated') {
      router.replace(session.user?.role === 'admin' ? '/dashboard' : '/my-certificates')
    }
  }, [router, session, status])

  return (
    <div className="min-h-screen flex items-center justify-center gap-3">
      <Loader2 className="h-5 w-5 animate-spin" />
      <p>Signing you in...</p>
    </div>
  )
}
