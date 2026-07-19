import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { errorResponse } from '@/lib/api/errors'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type AuthContext = {
  userId: string
  supabase: SupabaseClient<Database>
}

export async function requireAuth(req: NextRequest): Promise<AuthContext | NextResponse> {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return errorResponse('unauthenticated', 'Sign in to continue.', 401)
  }

  return { userId: user.id, supabase }
}
