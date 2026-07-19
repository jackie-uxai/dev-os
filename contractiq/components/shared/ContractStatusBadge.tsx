import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import type { ContractStatus } from '@/types/database'

const STATUS_CONFIG: Record<ContractStatus, { label: string; tone: BadgeTone; icon: typeof Loader2 }> = {
  processing: { label: 'Processing', tone: 'warning', icon: Loader2 },
  ready: { label: 'Ready', tone: 'success', icon: CheckCircle2 },
  error: { label: 'Failed', tone: 'error', icon: XCircle },
}

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const { label, tone, icon: Icon } = STATUS_CONFIG[status]
  return (
    <Badge tone={tone}>
      <Icon size={12} strokeWidth={1.5} className={status === 'processing' ? 'animate-spin' : undefined} />
      {label}
    </Badge>
  )
}
