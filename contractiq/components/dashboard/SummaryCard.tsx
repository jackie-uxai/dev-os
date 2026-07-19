import Link from 'next/link'
import { FileText, UploadCloud } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { DashboardResponse } from '@/types/api'

export function SummaryCard({ total, byType }: { total: number; byType: DashboardResponse['by_type'] }) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-6">
      <div className="flex flex-wrap items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
            <FileText size={20} strokeWidth={1.5} className="text-primary" />
          </div>
          <div>
            <p className="text-h2 text-content-primary">{total}</p>
            <p className="text-small text-content-muted">Contracts reviewed</p>
          </div>
        </div>
        <div>
          <p className="text-h4 text-content-primary">{byType.NDA}</p>
          <p className="text-small text-content-muted">NDAs</p>
        </div>
        <div>
          <p className="text-h4 text-content-primary">{byType.MSA}</p>
          <p className="text-small text-content-muted">MSAs</p>
        </div>
      </div>

      <Link
        href="/upload"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-body-lg font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
      >
        <UploadCloud size={18} strokeWidth={1.5} />
        Review a Contract
      </Link>
    </Card>
  )
}
