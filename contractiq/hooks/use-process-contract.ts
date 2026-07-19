import { useMutation } from '@tanstack/react-query'
import { fetchJson } from '@/lib/api/fetch-json'
import type { ProcessContractResponse } from '@/types/api'

export function useProcessContract() {
  return useMutation({
    mutationFn: async ({ contractId, customTerms }: { contractId: string; customTerms: string[] }) =>
      fetchJson<ProcessContractResponse>(`/api/contracts/${contractId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_terms: customTerms }),
      }),
  })
}
