export const STANDARD_TERMS: Record<'NDA' | 'MSA', string[]> = {
  NDA: [
    'Parties',
    'Effective Date',
    'Confidentiality Obligations',
    'Permitted Disclosures',
    'Term & Duration',
    'Governing Law',
    'Jurisdiction',
    'IP Ownership',
    'Non-Solicitation',
    'Breach & Remedy',
  ],
  MSA: [
    'Parties',
    'Service Scope',
    'Payment Terms',
    'Invoice Schedule',
    'Late Payment Penalty',
    'Liability Cap',
    'Indemnification',
    'IP Ownership',
    'Termination Clause',
    'Governing Law',
    'Dispute Resolution',
    'Notice Period',
  ],
}

export const MAX_CUSTOM_TERMS = 5
export const MAX_CUSTOM_TERM_LENGTH = 80
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
export const MAX_PAGE_COUNT = 20
export const MAX_CONTRACT_TOKENS = 15_000
export const MIN_WORD_COUNT = 100 // below this, treat as a scanned/image PDF
export const MAX_CHAT_HISTORY = 200
export const MAX_CHAT_MESSAGE_LENGTH = 2000
