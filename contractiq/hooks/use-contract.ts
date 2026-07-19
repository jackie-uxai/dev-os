import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/lib/api/fetch-json'
import type { ContractDetailResponse } from '@/types/api'

export function useContract(contractId: string) {
  return useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => fetchJson<ContractDetailResponse>(`/api/contracts/${contractId}`),
    refetchInterval: (query) => (query.state.data?.contract.status === 'processing' ? 3000 : false),
  })
}
