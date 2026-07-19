import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'h-11 w-full appearance-none rounded-lg border border-border-strong bg-surface-bg px-4 pr-10 text-body-lg text-content-primary',
            'transition-colors duration-150 ease-out focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
            'disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-content-muted',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          size={18}
          strokeWidth={1.5}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-content-muted"
        />
      </div>
    )
  }
)
Select.displayName = 'Select'
