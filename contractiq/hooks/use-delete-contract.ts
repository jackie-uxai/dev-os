import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchJson } from '@/lib/api/fetch-json'

export function useDeleteContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contractId: string) => fetchJson<void>(`/api/contracts/${contractId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
