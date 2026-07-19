'use client'

import { useState, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { Textarea } from '@/components/ui/Input'

const MAX_LENGTH = 2000

export function ChatInput({ onSend, isDisabled }: { onSend: (message: string) => void; isDisabled: boolean }) {
  const [value, setValue] = useState('')

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || isDisabled) return
    onSend(trimmed)
    setValue('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-end gap-2">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about this contract…"
          rows={2}
          disabled={isDisabled}
          className="resize-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={isDisabled || !value.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-colors duration-150 ease-out hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-primary/50"
        >
          <Send size={18} strokeWidth={1.5} />
        </button>
      </div>
      {value.length > MAX_LENGTH - 200 && (
        <p className="text-right text-small text-content-muted">
          {value.length}/{MAX_LENGTH}
        </p>
      )}
    </div>
  )
}
