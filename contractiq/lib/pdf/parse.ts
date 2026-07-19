/**
 * Inserts a "[PAGE N]" marker before each page's text so downstream features
 * (extraction prompts, the text-viewer fallback) can attribute content to a
 * page without re-parsing the PDF.
 */
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export async function extractTextWithPageMarkers(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')

  if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
    const workerFile = join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.min.mjs')
    pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(workerFile).href
  }

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) })
  const doc = await loadingTask.promise

  try {
    const pages: Array<{ num: number; text: string }> = []
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item) => (typeof item === 'string' ? item : 'str' in item ? item.str : ''))
        .filter(Boolean)
        .join(' ')
        .trim()

      pages.push({ num: pageNumber, text: pageText })
      page.cleanup()
    }

    const text = pages.map((page) => `[PAGE ${page.num}]\n${page.text}`).join('\n\n')
    return { text, pageCount: doc.numPages }
  } finally {
    await doc.destroy()
  }
}
