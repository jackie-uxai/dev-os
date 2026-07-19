import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/with-auth'
import { errorResponse } from '@/lib/api/errors'
import { feedbackSchema } from '@/lib/validation/contract'

export const POST = withAuth(async (req: NextRequest, { userId, supabase, params }) => {
  const body = await req.json().catch(() => ({}))
  const parsed = feedbackSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse('validation_error', parsed.error.issues[0]?.message ?? 'Invalid request body.', 400)
  }

  const { data: contract } = await supabase.from('contracts').select('id').eq('id', params.id).eq('user_id', userId).single()
  if (!contract) return errorResponse('not_found', 'Contract not found.', 404)

  const { data: feedback, error } = await supabase
    .from('user_feedback')
    .insert({
      contract_id: contract.id,
      user_id: userId,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    })
    .select()
    .single()

  if (error || !feedback) return errorResponse('internal_error', 'Could not save feedback. Please try again.', 500)

  return NextResponse.json({ feedback }, { status: 201 })
})
