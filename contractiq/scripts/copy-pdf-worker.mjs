import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Self-hosts the PDF.js worker so react-pdf never depends on a third-party
// CDN and Next.js's build-time Terser pass never tries to minify the
// worker's ESM `import.meta` syntax (which it cannot parse). Runs on every
// `npm install` via the postinstall script so it stays in sync with
// whatever pdfjs-dist version react-pdf pulls in.
const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

const source = join(projectRoot, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
const destDir = join(projectRoot, 'public')
const dest = join(destDir, 'pdf.worker.min.mjs')

mkdirSync(destDir, { recursive: true })
copyFileSync(source, dest)

console.log('Copied pdf.worker.min.mjs to public/')
