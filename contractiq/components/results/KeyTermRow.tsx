'use client'

import { useState } from 'react'
import { AlertTriangle, ChevronDown, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'
import { Input } from '@/components/ui/Input'
import type { KeyTerm } from '@/types/database'

function confidenceTone(score: number | null): 'success' | 'warning' | 'error' {
  if (score === null) return 'error'
  if (score >= 80) return 'success'
  if (score >= 50) return 'warning'
  return 'error'
}

export function KeyTermRow({
  term,
  onNavigateToPage,
  onEdit,
  isSaving,
}: {
  term: KeyTerm
  onNavigateToPage: (page: number) => void
  onEdit: (value: string) => void
  isSaving: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftValue, setDraftValue] = useState(term.value ?? '')
  const [isWhyOpen, setIsWhyOpen] = useState(false)

  const tone = confidenceTone(term.confidence_score)
  const isLowConfidence = term.confidence_score === null || term.confidence_score < 50

  function commitEdit() {
    const trimmed = draftValue.trim()
    setIsEditing(false)
    if (!trimmed || trimmed === term.value) {
      setDraftValue(term.value ?? '')
      return
    }
    onEdit(trimmed)
  }

  return (
    <li className="rounded-lg border border-border bg-surface-bg px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-body font-medium text-content-primary">{term.term_name}</span>
            {term.is_manual && <Badge tone="info">Custom</Badge>}
            {term.is_edited && <Badge tone="neutral">Edited</Badge>}
          </div>

          {isEditing ? (
            <Input
              autoFocus
              value={draftValue}
              onChange={(e) => setDraftValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitEdit()
                if (e.key === 'Escape') {
                  setDraftValue(term.value ?? '')
                  setIsEditing(false)
                }
              }}
              className="mt-1"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="group mt-1 flex items-center gap-1.5 text-left text-body-lg text-content-primary hover:text-primary"
            >
              {term.value || 'Not found in document'}
              <Pencil size={14} strokeWidth={1.5} className="text-content-muted opacity-0 group-hover:opacity-100" />
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {term.page_number !== null && (
            <button
              type="button"
              onClick={() => onNavigateToPage(term.page_number!)}
              className="rounded border border-border-strong px-2 py-1 text-small text-content-secondary hover:border-primary hover:text-primary"
            >
              Page {term.page_number}
            </button>
          )}

          {isLowConfidence ? (
            <Tooltip content="Low confidence — we recommend verifying this in the document directly." nonDismissible>
              <Badge tone={tone}>
                <AlertTriangle size={12} strokeWidth={1.5} />
                {term.confidence_score !== null ? `${Math.round(term.confidence_score)}%` : '—'}
              </Badge>
            </Tooltip>
          ) : (
            <Badge tone={tone}>{Math.round(term.confidence_score!)}%</Badge>
          )}
        </div>
      </div>

      {term.source_sentence && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setIsWhyOpen((prev) => !prev)}
            className="flex items-center gap-1 text-small font-medium text-content-secondary hover:text-content-primary"
          >
            Why?
            <ChevronDown size={12} strokeWidth={1.5} className={isWhyOpen ? 'rotate-180' : undefined} />
          </button>
          {isWhyOpen && (
            <p className="mt-1.5 rounded-md bg-surface-subtle p-3 text-small text-content-secondary">
              &ldquo;{term.source_sentence}&rdquo;
            </p>
          )}
        </div>
      )}

      {isSaving && <p className="mt-1 text-small text-content-muted">Saving…</p>}
    </li>
  )
}
