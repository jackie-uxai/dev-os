import { z } from 'zod'
import { getOpenAIClient } from '@/lib/openai/client'
import { withRetry } from '@/lib/openai/with-retry'
import { buildExtractionMessages, RETRY_MESSAGE } from '@/lib/openai/extraction-prompt'
import type { ContractType } from '@/types/database'

const extractionResponseSchema = z.object({
  key_terms: z.array(
    z.object({
      term_name: z.string(),
      value: z.string(),
      page_number: z.number().nullable(),
      confidence_score: z.number().min(0).max(1),
      source_sentence: z.string(),
    })
  ),
})

export type ExtractionResult = z.infer<typeof extractionResponseSchema>

export async function extractKeyTerms(
  contractType: ContractType,
  contractText: string,
  customTerms: string[]
): Promise<ExtractionResult> {
  const messages = buildExtractionMessages(contractType, contractText, customTerms)
  const openai = getOpenAIClient()

  return withRetry(async () => {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.1,
      max_completion_tokens: 2000,
      response_format: { type: 'json_object' },
      messages,
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    let parsed: unknown

    try {
      parsed = JSON.parse(raw)
    } catch {
      const retryCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.1,
        max_completion_tokens: 2000,
        response_format: { type: 'json_object' },
        messages: [...messages, { role: 'assistant', content: raw }, { role: 'user', content: RETRY_MESSAGE }],
      })
      parsed = JSON.parse(retryCompletion.choices[0]?.message?.content ?? '{}')
    }

    return extractionResponseSchema.parse(parsed)
  })
}
