import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-lg border bg-surface-bg px-4 text-body-lg text-content-primary placeholder:text-content-muted',
        'transition-colors duration-150 ease-out focus:outline-none focus:ring-1',
        error
          ? 'border-error focus:border-error focus:ring-error'
          : 'border-border-strong focus:border-primary focus:ring-primary',
        'disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-content-muted',
        className
      )}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border bg-surface-bg px-4 py-3 text-body-lg text-content-primary placeholder:text-content-muted',
        'transition-colors duration-150 ease-out focus:outline-none focus:ring-1',
        error
          ? 'border-error focus:border-error focus:ring-error'
          : 'border-border-strong focus:border-primary focus:ring-primary',
        'disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-content-muted',
        className
      )}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'
