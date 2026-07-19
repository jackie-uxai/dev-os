import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/with-auth'
import { errorResponse } from '@/lib/api/errors'
import { patchKeyTermSchema } from '@/lib/validation/contract'

export const PATCH = withAuth(async (req: NextRequest, { userId, supabase, params }) => {
  const body = await req.json().catch(() => ({}))
  const parsed = patchKeyTermSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse('validation_error', parsed.error.issues[0]?.message ?? 'Invalid request body.', 400)
  }

  // original_value is intentionally never touched here — it is set once at
  // extraction time and must keep the AI's first-ever value for the
  // term_corrections feedback loop, even across repeated edits.
  const { data: term, error } = await supabase
    .from('key_terms')
    .update({ value: parsed.data.value, is_edited: true })
    .eq('id', params.termId)
    .eq('contract_id', params.id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !term) return errorResponse('not_found', 'Key term not found.', 404)

  return NextResponse.json({ key_term: term })
})
