'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react'
import { Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useSubmitFeedback } from '@/hooks/use-feedback'
import { cn } from '@/lib/utils/cn'

export function FeedbackWidget({ contractId }: { contractId: string }) {
  const [rating, setRating] = useState<'up' | 'down' | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const submitFeedback = useSubmitFeedback(contractId)

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-3">
        <CheckCircle2 size={18} strokeWidth={1.5} className="text-success" />
        <p className="text-body text-content-secondary">Thanks for the feedback</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-4">
      <p className="mb-2 text-body font-medium text-content-primary">Were the extracted terms accurate?</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setRating('up')}
          aria-label="Thumbs up"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md border transition-colors duration-150 ease-out',
            rating === 'up' ? 'border-success bg-success/10 text-success' : 'border-border-strong text-content-secondary hover:bg-surface-subtle'
          )}
        >
          <ThumbsUp size={16} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => setRating('down')}
          aria-label="Thumbs down"
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md border transition-colors duration-150 ease-out',
            rating === 'down' ? 'border-error bg-error/10 text-error' : 'border-border-strong text-content-secondary hover:bg-surface-subtle'
          )}
        >
          <ThumbsDown size={16} strokeWidth={1.5} />
        </button>
      </div>

      {rating && (
        <div className="mt-3 flex flex-col gap-2">
          <Textarea
            placeholder="Anything you'd like to add? (optional)"
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
          />
          <Button
            size="sm"
            className="self-start"
            isLoading={submitFeedback.isPending}
            onClick={() =>
              submitFeedback.mutate(
                { rating, comment: comment.trim() || undefined },
                { onSuccess: () => setIsSubmitted(true) }
              )
            }
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  )
}
