import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchJson } from '@/lib/api/fetch-json'
import type { ContractDetailResponse } from '@/types/api'
import type { KeyTerm } from '@/types/database'

export function useUpdateKeyTerm(contractId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ termId, value }: { termId: string; value: string }) =>
      fetchJson<{ key_term: KeyTerm }>(`/api/contracts/${contractId}/key-terms/${termId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      }),
    onSuccess: ({ key_term }) => {
      queryClient.setQueryData<ContractDetailResponse>(['contract', contractId], (old) => {
        if (!old) return old
        return {
          ...old,
          key_terms: old.key_terms.map((t) => (t.id === key_term.id ? key_term : t)),
        }
      })
    },
  })
}
