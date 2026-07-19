'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    setIsSubmitting(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 size={32} strokeWidth={1.5} className="text-success" />
        <h1 className="text-h3 text-content-primary">Check your email</h1>
        <p className="text-body text-content-secondary">
          We sent a confirmation link to <span className="font-medium text-content-primary">{email}</span>. Click it
          to activate your account.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-h3 text-content-primary">Create your account</h1>
      <p className="mt-1 text-body text-content-secondary">Start reviewing contracts in minutes.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-body text-content-secondary">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-body text-content-secondary">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-1 block text-body text-content-secondary">
            Confirm password
          </label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-small text-error">{error}</p>}

        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Get Started Free
        </Button>
      </form>

      <p className="mt-6 text-center text-body text-content-secondary">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-primary hover:text-primary-hover">
          Sign in
        </Link>
      </p>
    </div>
  )
}
