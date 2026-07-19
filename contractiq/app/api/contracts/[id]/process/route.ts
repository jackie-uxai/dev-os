import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/with-auth'
import { errorResponse } from '@/lib/api/errors'
import { checkRateLimit } from '@/lib/api/rate-limit'
import { processContractSchema } from '@/lib/validation/contract'
import { extractKeyTerms } from '@/lib/openai/extract-key-terms'

export const POST = withAuth(async (req: NextRequest, { userId, supabase, params }) => {
  const allowed = await checkRateLimit(userId, 'process')
  if (!allowed) return errorResponse('rate_limited', 'Too many requests. Try again shortly.', 429)

  const body = await req.json().catch(() => ({}))
  const parsed = processContractSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse('validation_error', parsed.error.issues[0]?.message ?? 'Invalid request body.', 400)
  }

  const { data: contract } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single()

  if (!contract || !contract.contract_text) {
    return errorResponse('not_found', 'Contract not found.', 404)
  }

  try {
    const extracted = await extractKeyTerms(contract.contract_type, contract.contract_text, parsed.data.custom_terms)

    const rows = extracted.key_terms.map((t) => ({
      contract_id: contract.id,
      user_id: userId,
      term_name: t.term_name,
      value: t.value,
      original_value: t.value,
      page_number: t.page_number,
      confidence_score: Math.round(t.confidence_score * 100 * 100) / 100, // 0.0-1.0 -> 0-100, 2dp
      source_sentence: t.source_sentence,
      is_manual: parsed.data.custom_terms.includes(t.term_name),
    }))

    const { data: keyTerms, error: insertError } = await supabase.from('key_terms').insert(rows).select()
    if (insertError) throw insertError

    await supabase.from('contracts').update({ status: 'ready' }).eq('id', contract.id)

    return NextResponse.json({ status: 'ready', key_terms: keyTerms })
  } catch {
    await supabase
      .from('contracts')
      .update({ status: 'error', error_message: 'Extraction failed. Please try again.' })
      .eq('id', contract.id)
    return errorResponse('upstream_error', 'AI extraction failed after retries. You can retry without re-uploading.', 502)
  }
})
