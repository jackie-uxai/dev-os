'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={150}>{children}</TooltipPrimitive.Provider>
}

export function Tooltip({
  content,
  children,
  nonDismissible = false,
}: {
  content: React.ReactNode
  children: React.ReactNode
  /** Keeps the tooltip visible on focus, not just hover — used for the
   * non-dismissible low-confidence warning (FR-11 requires it to always be
   * reachable, including via keyboard). */
  nonDismissible?: boolean
}) {
  return (
    <TooltipPrimitive.Root delayDuration={nonDismissible ? 0 : 150}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side="top"
          sideOffset={6}
          className="z-50 max-w-xs rounded-md bg-content-primary px-3 py-2 text-small text-white shadow-lg"
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-content-primary" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
