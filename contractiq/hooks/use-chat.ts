import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchJson } from '@/lib/api/fetch-json'
import type { ChatHistoryResponse, ChatSendResponse } from '@/types/api'

export function useChatHistory(contractId: string) {
  return useQuery({
    queryKey: ['chat', contractId],
    queryFn: () => fetchJson<ChatHistoryResponse>(`/api/contracts/${contractId}/chat`),
  })
}

export function useSendChatMessage(contractId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (message: string) =>
      fetchJson<ChatSendResponse>(`/api/contracts/${contractId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      }),
    onSuccess: ({ message }) => {
      queryClient.setQueryData<ChatHistoryResponse>(['chat', contractId], (old) => ({
        messages: [...(old?.messages ?? []), message],
      }))
    },
  })
}
