'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Page() {
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [isGoogleUser, setIsGoogleUser] = useState(false)
  const supabase = createClient()

  // Check if user signed up with Google (no email confirmation needed)
  useEffect(() => {
    const checkUserProvider = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.identities?.[0]?.provider === 'google') {
        setIsGoogleUser(true)
      }
    }
    checkUserProvider()
  }, [supabase])

  const handleResend = async () => {
    setResendLoading(true)
    setResendMessage(null)
    try {
      const { error } = await supabase.auth.resend({ type: 'signup' })
      if (error) throw error
      setResendMessage('Confirmation email resent successfully!')
    } catch (err) {
      setResendMessage(
        err instanceof Error ? err.message : 'Failed to resend confirmation email'
      )
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Thank you for signing up!
              </CardTitle>
              <CardDescription>
                {isGoogleUser 
                  ? 'Your account is ready to use' 
                  : 'Check your email to confirm your account'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {isGoogleUser 
                  ? "You've successfully signed up! Your account is already confirmed and ready to use—start booking your session now or log in later."
                  : "You've successfully signed up. Please check your email (including spam/junk folders) to confirm your account before signing in."
                }
              </p>
              
              <div className="mt-4 flex flex-col gap-2">
                {/* Add Book Appointment button first for Google users */}
                {isGoogleUser && (
                  <Link href="/book">
                    <Button className="w-full bg-primary">Go to Book Appointment</Button>
                  </Link>
                )}

                <Link href="/auth/login">
                  <Button className={`w-full ${isGoogleUser ? 'bg-secondary' : 'bg-primary'}`}>
                    {isGoogleUser ? 'Go to Login' : 'Go to Login'}
                  </Button>
                </Link>
                
                {/* Hide resend button for Google users */}
                {!isGoogleUser && (
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full" 
                    onClick={handleResend}
                    disabled={resendLoading}
                  >
                    {resendLoading ? 'Resending...' : 'Resend Confirmation Email'}
                  </Button>
                )}
                
                {resendMessage && (
                  <p className={`mt-2 text-sm text-center ${
                    resendMessage.includes('successfully') 
                      ? 'text-green-600' 
                      : 'text-red-500'
                  }`}>
                    {resendMessage}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
