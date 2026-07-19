'use client'

import { KeyTermRow } from '@/components/results/KeyTermRow'
import { useUpdateKeyTerm } from '@/hooks/use-update-key-term'
import type { KeyTerm } from '@/types/database'

export function KeyTermsPanel({
  contractId,
  keyTerms,
  onNavigateToPage,
}: {
  contractId: string
  keyTerms: KeyTerm[]
  onNavigateToPage: (page: number) => void
}) {
  const updateKeyTerm = useUpdateKeyTerm(contractId)

  const standardTerms = keyTerms.filter((t) => !t.is_manual)
  const customTerms = keyTerms.filter((t) => t.is_manual)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-h4 text-content-primary">Key Terms</h2>
      <ul className="flex flex-col gap-3">
        {[...standardTerms, ...customTerms].map((term) => (
          <KeyTermRow
            key={term.id}
            term={term}
            onNavigateToPage={onNavigateToPage}
            onEdit={(value) => updateKeyTerm.mutate({ termId: term.id, value })}
            isSaving={updateKeyTerm.isPending && updateKeyTerm.variables?.termId === term.id}
          />
        ))}
      </ul>
    </div>
  )
}
