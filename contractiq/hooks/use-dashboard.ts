import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/lib/api/fetch-json'
import type { DashboardResponse } from '@/types/api'

export type DashboardSort = 'date' | 'name' | 'type'
export type DashboardOrder = 'asc' | 'desc'

export function useDashboard(sort: DashboardSort, order: DashboardOrder) {
  return useQuery({
    queryKey: ['dashboard', sort, order],
    queryFn: () => fetchJson<DashboardResponse>(`/api/dashboard?sort=${sort}&order=${order}`),
  })
}
