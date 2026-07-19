import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/with-auth'
import type { ContractSummary } from '@/types/api'

const SORT_COLUMN: Record<string, string> = { date: 'created_at', name: 'name', type: 'contract_type' }

export const GET = withAuth(async (req: NextRequest, { userId, supabase }) => {
  const url = new URL(req.url)
  const sort = SORT_COLUMN[url.searchParams.get('sort') ?? 'date'] ?? 'created_at'
  const ascending = url.searchParams.get('order') === 'asc'

  const { data: contracts, count } = await supabase
    .from('contracts')
    .select('id, name, contract_type, status, created_at', { count: 'exact' })
    .eq('user_id', userId)
    .order(sort, { ascending })
    .returns<ContractSummary[]>()

  const byType = { NDA: 0, MSA: 0 }
  for (const c of contracts ?? []) {
    byType[c.contract_type] += 1
  }

  return NextResponse.json({
    total: count ?? 0,
    by_type: byType,
    contracts: contracts ?? [],
  })
})
