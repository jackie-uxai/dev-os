'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpDown, Trash2 } from 'lucide-react'
import { ContractStatusBadge } from '@/components/shared/ContractStatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useDeleteContract } from '@/hooks/use-delete-contract'
import type { ContractSummary } from '@/types/api'
import type { DashboardOrder, DashboardSort } from '@/hooks/use-dashboard'

const COLUMNS: { key: DashboardSort; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'date', label: 'Date' },
]

export function ContractTable({
  contracts,
  sort,
  order,
  onSortChange,
}: {
  contracts: ContractSummary[]
  sort: DashboardSort
  order: DashboardOrder
  onSortChange: (sort: DashboardSort) => void
}) {
  const router = useRouter()
  const deleteContract = useDeleteContract()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const pendingDeleteContract = contracts.find((c) => c.id === pendingDeleteId) ?? null

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface-elevated">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border">
            {COLUMNS.map(({ key, label }) => (
              <th key={key} className="px-6 py-3">
                <button
                  onClick={() => onSortChange(key)}
                  className="flex items-center gap-1.5 text-small font-medium text-content-secondary hover:text-content-primary"
                >
                  {label}
                  <ArrowUpDown
                    size={12}
                    strokeWidth={1.5}
                    className={sort === key ? 'text-primary' : 'text-content-muted'}
                  />
                </button>
              </th>
            ))}
            <th className="px-6 py-3 text-small font-medium text-content-secondary">Status</th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract) => {
            const isClickable = contract.status === 'ready'
            return (
              <tr
                key={contract.id}
                onClick={() => isClickable && router.push(`/contracts/${contract.id}`)}
                className={
                  isClickable
                    ? 'cursor-pointer border-b border-border last:border-0 hover:bg-surface-subtle'
                    : 'border-b border-border last:border-0'
                }
              >
                <td className="px-6 py-4 text-body-lg text-content-primary">{contract.name}</td>
                <td className="px-6 py-4 text-body text-content-secondary">{contract.contract_type}</td>
                <td className="px-6 py-4 text-body text-content-secondary">
                  {new Date(contract.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4">
                  <ContractStatusBadge status={contract.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPendingDeleteId(contract.id)
                    }}
                    aria-label={`Delete ${contract.name}`}
                    className="rounded p-1.5 text-content-muted hover:bg-error/10 hover:text-error"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <ConfirmDialog
        open={pendingDeleteContract !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="Delete this contract?"
        description={`This will permanently delete "${pendingDeleteContract?.name}", its extracted terms, and its chat history. This cannot be undone.`}
        confirmLabel="Delete"
        isConfirming={deleteContract.isPending}
        onConfirm={() => {
          if (!pendingDeleteId) return
          deleteContract.mutate(pendingDeleteId, { onSuccess: () => setPendingDeleteId(null) })
        }}
      />
    </div>
  )
}
