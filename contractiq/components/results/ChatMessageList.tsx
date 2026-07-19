import { MessageSquareText } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import type { ChatMessage } from '@/types/database'

function CitationChip({ page, onNavigateToPage }: { page: number; onNavigateToPage: (page: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onNavigateToPage(page)}
      className="mt-2 inline-flex items-center rounded border border-primary/30 bg-primary/5 px-2 py-0.5 text-small font-medium text-primary hover:bg-primary/10"
    >
      Page {page}
    </button>
  )
}

export function ChatMessageList({
  messages,
  pendingUserMessage,
  isAwaitingReply,
  onNavigateToPage,
}: {
  messages: ChatMessage[]
  pendingUserMessage: string | null
  isAwaitingReply: boolean
  onNavigateToPage: (page: number) => void
}) {
  if (messages.length === 0 && !pendingUserMessage) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <MessageSquareText size={24} strokeWidth={1.5} className="text-content-muted" />
        <p className="text-body text-content-secondary">Ask a question about this contract</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
      {messages.map((message) => (
        <div key={message.id} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
          <div
            className={
              message.role === 'user'
                ? 'max-w-[85%] rounded-lg bg-primary px-4 py-2.5 text-body text-white'
                : 'max-w-[85%] rounded-lg bg-surface px-4 py-2.5 text-body text-content-primary'
            }
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.role === 'assistant' && message.page_citation && (
              <CitationChip page={message.page_citation} onNavigateToPage={onNavigateToPage} />
            )}
          </div>
        </div>
      ))}

      {pendingUserMessage && (
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-lg bg-primary px-4 py-2.5 text-body text-white opacity-70">
            <p className="whitespace-pre-wrap">{pendingUserMessage}</p>
          </div>
        </div>
      )}

      {isAwaitingReply && (
        <div className="flex justify-start">
          <div className="flex items-center gap-2 rounded-lg bg-surface px-4 py-2.5">
            <Spinner size={14} />
            <span className="text-small text-content-secondary">Thinking…</span>
          </div>
        </div>
      )}
    </div>
  )
}
