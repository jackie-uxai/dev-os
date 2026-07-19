import type { QueryClass } from '@/lib/openai/classify-query'

const SYSTEM_PROMPTS: Record<QueryClass, string> = {
  contract: `Answer only from the contract. Cite [Page X]. If the answer is not in the document, say so plainly: "I cannot find this in the document."`,
  history: `Answer only from the conversation history. Do not use the contract text. End your answer with "[From conversation]". If the answer is not in the conversation, say plainly: "I cannot find this in the conversation."`,
  both: `Answer from both the conversation and the contract text. Attribute each fact to its source using "[Page X]" for contract facts and "[From conversation]" for conversational facts. If the answer is not found in either, say plainly: "I cannot find this in the document or conversation."`,
}

export interface ChatHistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

export function buildChatMessages(
  contractText: string | null,
  history: ChatHistoryMessage[],
  queryClass: QueryClass,
  userMessage: string
) {
  const system = `${SYSTEM_PROMPTS[queryClass]}${queryClass === 'history' ? '' : `\n\nContract text:\n\n${contractText ?? ''}`}`
  const messages = [{ role: 'system' as const, content: system }, ...history]
  return [...messages, { role: 'user' as const, content: userMessage }]
}

const CITATION_PATTERN = /\[Page \d+\]/i
const FROM_CONVERSATION_PATTERN = /\[From conversation\]/i
const NOT_FOUND_PATTERN = /cannot find this in the document|cannot find this in the conversation|cannot find this in the document or conversation/i

export function isGrounded(responseText: string): boolean {
  return CITATION_PATTERN.test(responseText) || FROM_CONVERSATION_PATTERN.test(responseText) || NOT_FOUND_PATTERN.test(responseText)
}

export const CITATION_RETRY_MESSAGE =
  'Your previous response was missing a required "[Page X]" or "[From conversation]" citation, or the "I cannot find this in the document/conversation" fallback. Revise your answer to include one.'
