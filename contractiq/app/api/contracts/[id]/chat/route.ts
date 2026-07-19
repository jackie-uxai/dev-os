import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/with-auth'
import { errorResponse } from '@/lib/api/errors'
import { checkRateLimit } from '@/lib/api/rate-limit'
import { chatMessageSchema } from '@/lib/validation/contract'
import { classifyQuery } from '@/lib/openai/classify-query'
import { sendChatCompletion } from '@/lib/openai/send-chat-completion'
import { MAX_CHAT_HISTORY } from '@/lib/constants/standard-terms'
import { isPromptInjection, sanitizeForLLM } from '@/lib/security/promptInjectionGuard'
import { verifyContractOwnership } from '@/lib/security/chatSecurity'

export const GET = withAuth(async (req: NextRequest, { userId, supabase, params }) => {
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('contract_id', params.id)
    .eq('user_id', userId)
    .maybeSingle()

  if (!session) return NextResponse.json({ messages: [] })

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', session.id)
    .order('created_at', { ascending: true })
    .limit(MAX_CHAT_HISTORY)

  return NextResponse.json({ messages: messages ?? [] })
})

export const POST = withAuth(async (req: NextRequest, { userId, supabase, params }) => {
  const allowed = await checkRateLimit(userId, 'chat')
  if (!allowed) return errorResponse('rate_limited', 'Too many messages. Try again shortly.', 429)

  const body = await req.json().catch(() => ({}))
  const parsed = chatMessageSchema.safeParse(body)
  if (!parsed.success) {
    return errorResponse('validation_error', parsed.error.issues[0]?.message ?? 'Invalid request body.', 400)
  }

  const contract = await verifyContractOwnership(supabase, params.id, userId)
  if (!contract?.contract_text) return errorResponse('not_found', 'Contract not found.', 404)

  if (isPromptInjection(parsed.data.message)) {
    return errorResponse('validation_error', 'Prompt injection detected.', 400)
  }

  const sanitizedMessage = sanitizeForLLM(parsed.data.message)

  let sessionId: string | null = null
  const { data: existingSession } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('contract_id', contract.id)
    .eq('user_id', userId)
    .maybeSingle()

  const historyRows = existingSession
    ? (
        await supabase
          .from('chat_messages')
          .select('role, content')
          .eq('session_id', existingSession.id)
          .order('created_at', { ascending: true })
          .limit(MAX_CHAT_HISTORY)
      ).data ?? []
    : []

  const queryClass = classifyQuery(sanitizedMessage, historyRows.length > 0)
  const historyForModel = queryClass === 'history' ? historyRows.slice(-20) : historyRows.slice(-10)

  if (existingSession) {
    sessionId = existingSession.id
  } else {
    const { data: createdSession, error: createSessionError } = await supabase
      .from('chat_sessions')
      .insert({ contract_id: contract.id, user_id: userId })
      .select('id')
      .single()
    if (createSessionError || !createdSession) {
      return errorResponse('internal_error', 'Could not start a chat session. Please try again.', 500)
    }
    sessionId = createdSession.id
  }

  await supabase.from('chat_messages').insert({ session_id: sessionId, role: 'user', content: sanitizedMessage })

  try {
    const replyText = await sendChatCompletion(
      queryClass === 'history' ? null : contract.contract_text,
      historyForModel,
      queryClass,
      sanitizedMessage
    )
    const pageCitation = replyText.match(/\[Page (\d+)\]/i)?.[1]

    const { data: assistantMessage, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role: 'assistant',
        content: replyText,
        page_citation: pageCitation ? Number(pageCitation) : null,
      })
      .select()
      .single()

    if (insertError || !assistantMessage) {
      return errorResponse('internal_error', 'Could not save the response. Please try again.', 500)
    }

    return NextResponse.json({ message: assistantMessage })
  } catch {
    return errorResponse('upstream_error', 'Chat failed after retries. Please try again.', 502)
  }
})
