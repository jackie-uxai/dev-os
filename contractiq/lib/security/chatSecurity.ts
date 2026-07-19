import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export type ContractOwnership = {
  id: string
  contract_text: string | null
  status: string
}

export async function verifyContractOwnership(
  supabase: SupabaseClient<Database>,
  contractId: string,
  userId: string
): Promise<ContractOwnership | null> {
  const { data: contract, error } = await supabase
    .from('contracts')
    .select('id, contract_text, status')
    .eq('id', contractId)
    .eq('user_id', userId)
    .single()

  if (error || !contract || contract.contract_text === null) return null
  return contract
}

export async function verifySessionOwnership(
  supabase: SupabaseClient<Database>,
  sessionId: string,
  userId: string
): Promise<boolean> {
  const { data: session, error } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  return Boolean(session && !error)
}
