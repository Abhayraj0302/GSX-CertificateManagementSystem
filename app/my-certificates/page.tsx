'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Award, Loader2, LogOut } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface UserCertificate {
  certificateId: string
  issuedAt: string
  certificateType: 'participation' | 'achievement'
  position?: string
  event: {
    name: string
    date: string
  } | null
}

export default function MyCertificatesPage() {
  const { data: session, status } = useSession()
  const [certificates, setCertificates] = useState<UserCertificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
      return
    }

    if (status !== 'authenticated') return

    let active = true
    fetch('/api/my-certificates')
      .then(async (response) => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Failed to load your certificates')
        return result.certificates as UserCertificate[]
      })
      .then((result) => {
        if (active) setCertificates(result)
      })
      .catch((requestError: Error) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [router, status])

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p>Loading your account...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/my-certificates" className="flex items-center gap-2 font-semibold">
            <Award className="h-6 w-6 text-primary" />
            Certify
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:inline">{session?.user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My certificates</h1>
          <p className="mt-2 text-gray-600">
            Certificates issued to {session?.user?.email} appear here.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading certificates...
          </div>
        ) : certificates.length === 0 && !error ? (
          <Card>
            <CardHeader>
              <CardTitle>No certificates yet</CardTitle>
              <CardDescription>
                If you attended an event, ask its organizer to add your participant record using
                this exact email address and issue your certificate. It will appear here
                automatically.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {certificates.map((certificate) => (
              <Card key={certificate.certificateId}>
                <CardHeader>
                  <CardTitle>{certificate.event?.name || 'Certificate'}</CardTitle>
                  <CardDescription>
                    {certificate.certificateType === 'achievement'
                      ? 'Achievement certificate'
                      : 'Participation certificate'}
                    {certificate.position ? ` · ${certificate.position}` : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>Certificate ID: {certificate.certificateId}</p>
                    {certificate.event?.date && (
                      <p>
                        Event date:{' '}
                        {new Date(certificate.event.date).toLocaleDateString()}
                      </p>
                    )}
                    <p>
                      Issued:{' '}
                      {new Date(certificate.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/verify/${encodeURIComponent(certificate.certificateId)}`}>
                      View or download certificate
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
