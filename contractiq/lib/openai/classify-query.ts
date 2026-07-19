const HISTORY_KEYWORDS = /\b(earlier|before|previously|you said|we discussed|last time|again)\b/i
const DOCUMENT_KEYWORDS = /\b(contract|clause|section|page|agreement|document|term)\b/i

export type QueryClass = 'contract' | 'history' | 'both'

/**
 * Full conversation history is always passed to the model regardless of
 * this classification (chat.md) — it only adjusts which instruction is
 * emphasized in the system prompt, so this stays a keyword heuristic rather
 * than a second model call.
 */
export function classifyQuery(message: string, hasHistory: boolean): QueryClass {
  if (!hasHistory) return 'contract'
  const mentionsHistory = HISTORY_KEYWORDS.test(message)
  const mentionsDocument = DOCUMENT_KEYWORDS.test(message)
  if (mentionsHistory && mentionsDocument) return 'both'
  if (mentionsHistory && !mentionsDocument) return 'history'
  return 'contract'
}
