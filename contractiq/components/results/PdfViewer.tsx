'use client'

import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ZoomIn, ZoomOut, Download } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import type { TargetPage } from '@/types/navigation'
import { Spinner } from '@/components/ui/Spinner'

// Self-hosted from public/ (see scripts/copy-pdf-worker.mjs) rather than
// bundled via `new URL(..., import.meta.url)` — Next.js's production
// Terser pass cannot parse the worker's ESM `import.meta` syntax when it's
// pulled through webpack, and a CDN worker would add a third-party runtime
// dependency for a core, trust-sensitive feature.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export function PdfViewer({ signedUrl, targetPage }: { signedUrl: string; targetPage: TargetPage }) {
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0)
  const [loadError, setLoadError] = useState(false)
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({})

  useEffect(() => {
    if (!targetPage) return
    const el = pageRefs.current[targetPage.page]
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    el.classList.add('page-highlight')
    const timeout = setTimeout(() => el.classList.remove('page-highlight'), 2000)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetPage?.page, targetPage?.token])

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface-bg py-16 text-center">
        <p className="text-body text-content-secondary">Preview expired — refresh the page to reload it.</p>
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-body font-medium text-primary hover:text-primary-hover"
        >
          <Download size={16} strokeWidth={1.5} />
          Download PDF
        </a>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-small font-medium text-primary hover:text-primary-hover"
        >
          <Download size={14} strokeWidth={1.5} />
          Download PDF
        </a>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            aria-label="Zoom out"
            className="rounded p-1.5 text-content-secondary hover:bg-surface-subtle hover:text-content-primary"
          >
            <ZoomOut size={16} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(2.5, s + 0.25))}
            aria-label="Zoom in"
            className="rounded p-1.5 text-content-secondary hover:bg-surface-subtle hover:text-content-primary"
          >
            <ZoomIn size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-surface-bg p-4">
        <Document
          file={signedUrl}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          onLoadError={() => setLoadError(true)}
          loading={
            <div className="flex justify-center py-16">
              <Spinner size={28} />
            </div>
          }
        >
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <div key={pageNum} ref={(el) => { pageRefs.current[pageNum] = el }} data-page={pageNum}>
              <Page pageNumber={pageNum} scale={scale} />
            </div>
          ))}
        </Document>
      </div>
    </div>
  )
}
