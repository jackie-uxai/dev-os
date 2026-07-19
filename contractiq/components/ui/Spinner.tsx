import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function Spinner({ className, size = 20 }: { className?: string; size?: number }) {
  return <Loader2 size={size} strokeWidth={1.5} className={cn('animate-spin text-primary', className)} />
}
