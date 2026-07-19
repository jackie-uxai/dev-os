import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { errorResponse } from '@/lib/api/errors'

export type AuthedContext = {
  userId: string
  supabase: SupabaseClient<Database>
  params: Record<string, string>
}

export type AuthedHandler = (req: NextRequest, ctx: AuthedContext) => Promise<NextResponse>

/**
 * Wraps every app/api Route Handler. Resolves the Supabase session from
 * cookies, returns 401 if absent, and passes a scoped Supabase server client
 * + userId into the handler. See api-conventions.md §1.
 */
export function withAuth(handler: AuthedHandler) {
  return async (req: NextRequest, routeCtx: { params: Record<string, string> } = { params: {} }) => {
    const supabase = createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return errorResponse('unauthenticated', 'Sign in to continue.', 401)
    }

    return handler(req, { userId: user.id, supabase, params: routeCtx.params ?? {} })
  }
}
