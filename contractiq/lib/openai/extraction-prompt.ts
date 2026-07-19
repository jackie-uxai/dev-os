import { STANDARD_TERMS } from '@/lib/constants/standard-terms'
import type { ContractType } from '@/types/database'

const NDA_FEW_SHOT_EXAMPLE = `
Example contract excerpt (NDA):
"[PAGE 2] This Agreement shall remain in effect for a period of thirty-six (36) months from the Effective Date, after which all confidentiality obligations shall survive for an additional twelve (12) months."

Correct extraction for "Term & Duration":
{ "term_name": "Term & Duration", "value": "36 months, plus 12-month survival of confidentiality obligations", "page_number": 2, "confidence_score": 0.94, "source_sentence": "This Agreement shall remain in effect for a period of thirty-six (36) months from the Effective Date, after which all confidentiality obligations shall survive for an additional twelve (12) months." }
`.trim()

const MSA_FEW_SHOT_EXAMPLE = `
Example contract excerpt (MSA):
"[PAGE 5] Client shall pay all undisputed invoices within thirty (30) days of receipt. Invoices unpaid after 30 days accrue a late fee of 1.5% per month on the outstanding balance."

Correct extraction for "Late Payment Penalty":
{ "term_name": "Late Payment Penalty", "value": "1.5% per month on outstanding balance after 30 days", "page_number": 5, "confidence_score": 0.91, "source_sentence": "Invoices unpaid after 30 days accrue a late fee of 1.5% per month on the outstanding balance." }
`.trim()

export const RETRY_MESSAGE =
  'Your previous response was not valid JSON. Return only the JSON object described in the system prompt — no explanation, no markdown.'

export function buildExtractionMessages(contractType: ContractType, contractText: string, customTerms: string[]) {
  const targetTerms = [...STANDARD_TERMS[contractType], ...customTerms]
  const fewShot = contractType === 'NDA' ? NDA_FEW_SHOT_EXAMPLE : MSA_FEW_SHOT_EXAMPLE

  const system = `You are a contract analysis assistant extracting key terms from a ${contractType}.

Extract ONLY from the document text provided below — never use general legal knowledge to fill in a value.
For each of these terms, find its value in the document: ${targetTerms.join(', ')}.

Rules:
- Every term must include the 1-indexed page number from the nearest preceding "[PAGE N]" marker in the source text.
- Every term must include the verbatim sentence (source_sentence) the value was drawn from.
- confidence_score is a float between 0.0 and 1.0 reflecting your certainty in the extracted value.
- If a term is not present in the document, return it with value: "Not found in document", confidence_score: 0.0, source_sentence: "", and page_number: null.
- Respond with ONLY a JSON object of the exact shape: { "key_terms": [ { "term_name": string, "value": string, "page_number": number | null, "confidence_score": number, "source_sentence": string } ] }. No prose, no markdown fences.

${fewShot}`

  const user = `Contract text:\n\n${contractText}`

  return [
    { role: 'system' as const, content: system },
    { role: 'user' as const, content: user },
  ]
}
