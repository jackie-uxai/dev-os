import { X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { STANDARD_TERMS } from '@/lib/constants/standard-terms'
import type { ContractType } from '@/types/database'

export function TermPreviewList({
  contractType,
  customTerms,
  onRemoveCustomTerm,
}: {
  contractType: ContractType
  customTerms: string[]
  onRemoveCustomTerm: (term: string) => void
}) {
  return (
    <ul className="flex flex-col gap-2">
      {STANDARD_TERMS[contractType].map((term) => (
        <li key={term} className="flex items-center justify-between rounded-lg border border-border bg-surface-bg px-4 py-2.5">
          <span className="text-body-lg text-content-primary">{term}</span>
        </li>
      ))}
      {customTerms.map((term) => (
        <li key={term} className="flex items-center justify-between rounded-lg border border-border bg-surface-bg px-4 py-2.5">
          <span className="flex items-center gap-2 text-body-lg text-content-primary">
            {term}
            <Badge tone="info">Custom</Badge>
          </span>
          <button
            type="button"
            onClick={() => onRemoveCustomTerm(term)}
            aria-label={`Remove ${term}`}
            className="rounded p-1 text-content-muted hover:bg-surface-subtle hover:text-content-primary"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </li>
      ))}
    </ul>
  )
}
