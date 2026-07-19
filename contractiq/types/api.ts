import type { ChatMessage, Contract, ContractStatus, ContractType, KeyTerm, UserFeedback } from '@/types/database'

export interface ContractSummary {
  id: string
  name: string
  contract_type: ContractType
  status: ContractStatus
  created_at: string
}

export interface DashboardResponse {
  total: number
  by_type: { NDA: number; MSA: number }
  contracts: ContractSummary[]
}

export interface UploadContractResponse {
  id: string
  name: string
  contract_type: ContractType
  status: ContractStatus
  page_count: number
}

export interface ProcessContractResponse {
  status: ContractStatus
  key_terms: KeyTerm[]
}

export interface ContractDetailResponse {
  contract: Contract
  key_terms: KeyTerm[]
  signed_url: string | null
}

export interface ChatHistoryResponse {
  messages: ChatMessage[]
}

export interface ChatSendResponse {
  message: ChatMessage
}

export interface FeedbackResponse {
  feedback: UserFeedback
}
