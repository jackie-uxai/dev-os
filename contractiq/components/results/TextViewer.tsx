'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { TargetPage } from '@/types/navigation'

function parsePages(contractText: string): { page: number; text: string }[] {
  const parts = contractText.split(/\[PAGE (\d+)\]/)
  const pages: { page: number; text: string }[] = []
  for (let i = 1; i < parts.length; i += 2) {
    pages.push({ page: Number(parts[i]), text: parts[i + 1]?.trim() ?? '' })
  }
  return pages
}

export function TextViewer({ contractText, targetPage }: { contractText: string; targetPage: TargetPage }) {
  const pages = useMemo(() => parsePages(contractText), [contractText])
  const sectionRefs = useRef<Record<number, HTMLElement | null>>({})

  useEffect(() => {
    if (!targetPage) return
    const el = sectionRefs.current[targetPage.page]
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    el.classList.add('page-highlight')
    const timeout = setTimeout(() => el.classList.remove('page-highlight'), 2000)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPage?.page, targetPage?.token])

  return (
    <div className="flex max-h-[80vh] flex-col gap-6 overflow-y-auto rounded-xl border border-border bg-surface-bg p-6">
      {pages.map(({ page, text }) => (
        <section key={page} ref={(el) => { sectionRefs.current[page] = el }} data-page={page}>
          <h3 className="mb-2 text-small font-medium text-content-muted">Page {page}</h3>
          <p className="whitespace-pre-wrap font-mono text-body text-content-primary">{text}</p>
        </section>
      ))}
    </div>
  )
}
