import { getOpenAIClient } from '@/lib/openai/client'
import { withRetry } from '@/lib/openai/with-retry'
import { buildChatMessages, isGrounded, CITATION_RETRY_MESSAGE, type ChatHistoryMessage } from '@/lib/openai/chat-prompt'
import type { QueryClass } from '@/lib/openai/classify-query'

export async function sendChatCompletion(
  contractText: string | null,
  history: ChatHistoryMessage[],
  queryClass: QueryClass,
  userMessage: string
): Promise<string> {
  const openai = getOpenAIClient()

  return withRetry(async () => {
    const messages = buildChatMessages(contractText, history, queryClass, userMessage)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.4,
      max_completion_tokens: 1000,
      messages,
    })
    let text = completion.choices[0]?.message?.content ?? ''

    if (!isGrounded(text)) {
      const retryCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.4,
        max_completion_tokens: 1000,
        messages: [...messages, { role: 'assistant', content: text }, { role: 'user', content: CITATION_RETRY_MESSAGE }],
      })
      text = retryCompletion.choices[0]?.message?.content ?? text
    }

    return text
  })
}
