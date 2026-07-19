'use client'

import dynamic from 'next/dynamic'
import { Spinner } from '@/components/ui/Spinner'
import { TextViewer } from '@/components/results/TextViewer'
import type { TargetPage } from '@/types/navigation'

// pdfjs-dist relies on browser-only APIs (DOMMatrix, canvas), so PdfViewer
// must never render during SSR.
const PdfViewer = dynamic(() => import('@/components/results/PdfViewer').then((mod) => mod.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-16">
      <Spinner size={28} />
    </div>
  ),
})

export function DocumentViewer({
  signedUrl,
  contractText,
  targetPage,
}: {
  signedUrl: string | null
  contractText: string
  targetPage: TargetPage
}) {
  if (signedUrl) return <PdfViewer signedUrl={signedUrl} targetPage={targetPage} />
  return <TextViewer contractText={contractText} targetPage={targetPage} />
}
