import { cn } from '@/lib/utils/cn'

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl border border-border bg-surface-elevated p-6', className)} {...props}>
      {children}
    </div>
  )
}
