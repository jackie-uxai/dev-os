'use client'

import { useState } from 'react'
import { useChatHistory, useSendChatMessage } from '@/hooks/use-chat'
import { ChatMessageList } from '@/components/results/ChatMessageList'
import { ChatInput } from '@/components/results/ChatInput'
import { Spinner } from '@/components/ui/Spinner'

export function ChatPanel({
  contractId,
  onNavigateToPage,
}: {
  contractId: string
  onNavigateToPage: (page: number) => void
}) {
  const { data, isLoading } = useChatHistory(contractId)
  const sendMessage = useSendChatMessage(contractId)
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)

  function handleSend(message: string) {
    setPendingUserMessage(message)
    setSendError(null)
    sendMessage.mutate(message, {
      onSuccess: () => setPendingUserMessage(null),
      onError: () => setSendError('Message failed to send.'),
    })
  }

  function handleRetry() {
    if (!pendingUserMessage) return
    setSendError(null)
    sendMessage.mutate(pendingUserMessage, {
      onSuccess: () => setPendingUserMessage(null),
      onError: () => setSendError('Message failed to send.'),
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={24} />
      </div>
    )
  }

  return (
    <div className="flex h-full max-h-[80vh] flex-col gap-3 rounded-xl border border-border bg-surface-elevated p-4">
      <ChatMessageList
        messages={data?.messages ?? []}
        pendingUserMessage={pendingUserMessage}
        isAwaitingReply={sendMessage.isPending}
        onNavigateToPage={onNavigateToPage}
      />
      {sendError && (
        <div className="flex items-center justify-between rounded-md bg-error/5 px-3 py-2">
          <p className="text-small text-error">{sendError}</p>
          <button type="button" onClick={handleRetry} className="text-small font-medium text-error underline">
            Retry
          </button>
        </div>
      )}
      <ChatInput onSend={handleSend} isDisabled={sendMessage.isPending} />
    </div>
  )
}
