'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText } from 'lucide-react'
import { useDashboard, type DashboardOrder, type DashboardSort } from '@/hooks/use-dashboard'
import { SummaryCard } from '@/components/dashboard/SummaryCard'
import { ContractTable } from '@/components/dashboard/ContractTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const sort = (searchParams.get('sort') as DashboardSort) ?? 'date'
  const order = (searchParams.get('order') as DashboardOrder) ?? 'desc'

  const { data, isLoading, isError } = useDashboard(sort, order)

  function handleSortChange(nextSort: DashboardSort) {
    const nextOrder: DashboardOrder = sort === nextSort && order === 'desc' ? 'asc' : 'desc'
    router.push(`/dashboard?sort=${nextSort}&order=${nextOrder}`)
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-8 py-10">
      <h1 className="text-h2 text-content-primary">Dashboard</h1>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      )}

      {isError && (
        <p className="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-body text-error">
          Could not load your dashboard. Please refresh the page.
        </p>
      )}

      {data && data.total === 0 && (
        <EmptyState
          icon={FileText}
          title="No contracts reviewed yet"
          description="Upload your first contract to begin."
          actionLabel="Review a Contract"
          onAction={() => router.push('/upload')}
        />
      )}

      {data && data.total > 0 && (
        <>
          <SummaryCard total={data.total} byType={data.by_type} />
          <ContractTable contracts={data.contracts} sort={sort} order={order} onSortChange={handleSortChange} />
        </>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}
