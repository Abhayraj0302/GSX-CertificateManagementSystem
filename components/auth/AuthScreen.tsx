'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProviders, signIn } from 'next-auth/react'
import { Award, Clock3, Loader2, ShieldCheck, UsersRound } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AuthScreenProps {
  mode: 'login' | 'signup'
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-7 w-7">
      <path fill="#4285F4" d="M47.6 24.5c0-1.6-.1-3.1-.4-4.5H24v9h13.2c-.6 2.9-2.3 5.3-4.8 7l7.7 6c4.5-4.2 7.5-10.4 7.5-17.5Z" />
      <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7.7-6c-2.1 1.4-4.8 2.3-8.3 2.3-6.3 0-11.7-4.2-13.6-9.9l-8 6.2C6.5 42.6 14.6 48 24 48Z" />
      <path fill="#FBBC05" d="M10.4 28.6a14.4 14.4 0 0 1 0-9.2l-8-6.2a24 24 0 0 0 0 21.6l8-6.2Z" />
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.7 1.2 9.2 3.6l6.9-6.9C35.9 2.4 30.5 0 24 0 14.6 0 6.5 5.4 2.4 13.2l8 6.2C12.3 13.7 17.7 9.5 24 9.5Z" />
    </svg>
  )
}

function CertificateIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 420 230"
      className="h-auto w-full max-w-[390px]"
      fill="none"
    >
      <ellipse cx="204" cy="130" rx="174" ry="92" fill="#DCE9FF" fillOpacity=".56" />
      <rect x="75" y="46" width="220" height="132" rx="10" fill="#9FC2FF" fillOpacity=".24" transform="rotate(-7 75 46)" />
      <rect x="105" y="32" width="222" height="137" rx="11" fill="#78A8FF" fillOpacity=".31" transform="rotate(-4 105 32)" />
      <g filter="url(#certificate-shadow)" transform="rotate(-11 203 103)">
        <rect x="91" y="38" width="214" height="132" rx="13" fill="white" />
        <circle cx="137" cy="91" r="21" fill="#DDEAFF" />
        <circle cx="137" cy="91" r="15" stroke="#4382F5" strokeWidth="5" />
        <path d="m126 103 3 28 9-7 10 5 1-27" fill="#3977EB" />
        <rect x="174" y="72" width="86" height="12" rx="6" fill="#A9C7FF" />
        <rect x="174" y="96" width="72" height="10" rx="5" fill="#D4E2FA" />
        <rect x="174" y="117" width="64" height="10" rx="5" fill="#D4E2FA" />
        <rect x="111" y="145" width="37" height="9" rx="4.5" fill="#E8F0FF" />
      </g>
      <path d="m52 62-8-7m1 19-11-1m20-26-1-10" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
      <defs>
        <filter id="certificate-shadow" x="59" y="14" width="278" height="200" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
          <feOffset dy="12" />
          <feGaussianBlur stdDeviation="13" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0.19 0 0 0 0 0.42 0 0 0 0 0.87 0 0 0 0.2 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  )
}

export default function AuthScreen({ mode }: AuthScreenProps) {
  const [googleEnabled, setGoogleEnabled] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isLogin = mode === 'login'

  useEffect(() => {
    let active = true
    getProviders()
      .then((providers) => {
        if (active) setGoogleEnabled(Boolean(providers?.google))
      })
      .catch(() => {
        if (active) setGoogleEnabled(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      await signIn('google', { callbackUrl: '/auth/redirect' })
    } catch {
      setError('Unable to start Google sign-in. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f8ff] px-5 py-10 text-[#14213d] sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute -left-[155px] -top-[205px] h-[410px] w-[410px] rounded-full bg-[#c4d7ff] opacity-90" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-[160px] -top-[195px] h-[470px] w-[470px] rounded-full border border-[#d7e4ff]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[225px] -right-[145px] h-[430px] w-[430px] rounded-full bg-[#c4d7ff] opacity-80" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[200px] -right-[150px] h-[490px] w-[490px] rounded-full border border-[#d7e4ff]" />

      <div className="relative z-10 grid w-full max-w-[1026px] items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <section className="hidden lg:block">
          <Link href="/" className="mb-10 inline-flex items-center gap-4" aria-label="Certify home">
            <span className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#3478f6] to-[#1762e9] shadow-lg shadow-blue-500/20">
              <Award className="h-11 w-11 text-white" strokeWidth={1.8} />
            </span>
            <span>
              <span className="block text-[42px] font-bold leading-none tracking-tight text-[#12203a]">
                Certify
              </span>
              <span className="mt-1 block text-[17px] text-[#62738f]">Certificate Management</span>
            </span>
          </Link>

          <h1 className="text-[38px] font-bold leading-[1.16] tracking-[-1.2px] text-[#14213d]">
            Your certificates,
            <br />
            in <span className="bg-gradient-to-r from-[#2786f6] to-[#614af4] bg-clip-text text-transparent">one place.</span>
          </h1>
          <p className="mt-3 max-w-[390px] text-[17px] leading-[1.5] text-[#647590]">
            Sign in to access your certificates,
            <br />
            manage your organization and more.
          </p>

          <div className="mt-5 flex h-[214px] items-center justify-center">
            <CertificateIllustration />
          </div>

          <div className="mt-2 flex items-center text-[12px] leading-tight text-[#657895]">
            <div className="flex items-center gap-2 pr-7">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#4280ed]" />
              <span>Secure<br />&amp; Trusted</span>
            </div>
            <span aria-hidden="true" className="h-7 border-l border-[#d1ddef]" />
            <div className="flex items-center gap-2 px-7">
              <Clock3 className="h-5 w-5 shrink-0 text-[#4280ed]" />
              <span>Easy<br />Access</span>
            </div>
            <span aria-hidden="true" className="h-7 border-l border-[#d1ddef]" />
            <div className="flex items-center gap-2 pl-7">
              <UsersRound className="h-5 w-5 shrink-0 text-[#4280ed]" />
              <span>For Individuals<br />&amp; Organizations</span>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="auth-title"
          className="mx-auto w-full max-w-[508px] rounded-[20px] border border-[#d7e2ff] bg-white/95 px-7 py-9 shadow-[0_20px_55px_rgba(74,116,198,0.12)] sm:px-12 sm:py-12"
        >
          <div className="mb-6 inline-flex rounded-full bg-[#e9f1ff] px-3 py-1.5 text-[13px] font-semibold text-[#3477e8]">
            {isLogin ? 'Welcome back 👋' : 'Welcome to Certify 👋'}
          </div>

          <h2 id="auth-title" className="text-[30px] font-bold leading-tight tracking-[-0.8px] text-[#111c33] sm:text-[34px]">
            {isLogin ? 'Sign in to Certify' : 'Create your account'}
          </h2>
          <p className="mt-2 max-w-[370px] text-[17px] leading-[1.5] text-[#687994]">
            {isLogin
              ? 'Sign in to view your certificates or manage an organization.'
              : 'Your certificates will appear when an organizer issues one to your Google email address.'}
          </p>

          <div className="mt-8">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {googleEnabled === false && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  Google sign-in is not configured. Please contact the administrator.
                </AlertDescription>
              </Alert>
            )}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={!googleEnabled || loading}
              className="flex h-[56px] w-full items-center justify-center gap-4 rounded-xl border border-[#e1e7f1] bg-white text-[15px] font-semibold text-[#172033] shadow-[0_2px_5px_rgba(21,46,87,0.08)] transition hover:bg-[#f9fbff] hover:shadow-[0_4px_12px_rgba(21,46,87,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#4285f4]" />
              ) : (
                <GoogleMark />
              )}
              {loading ? 'Redirecting to Google...' : 'Continue with Google'}
            </button>
            {googleEnabled === null && (
              <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[#71809a]">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking Google sign-in...
              </p>
            )}
          </div>

          <div className="my-8 flex items-center gap-6 text-[13px] text-[#75839b]">
            <span className="h-px flex-1 bg-[#e3e8f0]" />
            <span>OR</span>
            <span className="h-px flex-1 bg-[#e3e8f0]" />
          </div>

          <p className="text-center text-[14px] text-[#6b7b96]">
            {isLogin ? 'New to Certify? ' : 'Already have an account? '}
            <Link
              href={isLogin ? '/signup' : '/login'}
              className="font-semibold text-[#2879ec] hover:text-[#175cc4] hover:underline"
            >
              {isLogin ? 'Create an account' : 'Sign in'}
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
