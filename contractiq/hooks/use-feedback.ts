import { useMutation } from '@tanstack/react-query'
import { fetchJson } from '@/lib/api/fetch-json'
import type { FeedbackResponse } from '@/types/api'

export function useSubmitFeedback(contractId: string) {
  return useMutation({
    mutationFn: ({ rating, comment }: { rating: 'up' | 'down'; comment?: string }) =>
      fetchJson<FeedbackResponse>(`/api/contracts/${contractId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      }),
  })
}
