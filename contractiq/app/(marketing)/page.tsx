import Link from 'next/link'
import { FileCheck, MessageSquareText, ShieldCheck } from 'lucide-react'

const FEATURES = [
  {
    icon: FileCheck,
    title: 'Key terms, extracted automatically',
    description:
      'Upload an NDA or MSA and get the 10-12 terms that matter most — value, page number, and confidence score for each.',
  },
  {
    icon: ShieldCheck,
    title: 'Every claim traceable to the page',
    description:
      'Low-confidence terms are flagged, never hidden. Click any term to jump straight to the sentence it came from.',
  },
  {
    icon: MessageSquareText,
    title: 'Chat with your contract',
    description:
      'Ask plain-English questions and get answers grounded strictly in your document, with a page citation every time.',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface-bg">
      <header className="flex items-center justify-between px-8 py-6 md:px-16">
        <span className="text-h3 font-bold text-primary">ContractIQ</span>
        <nav className="flex items-center gap-4">
          <Link href="/sign-in" className="text-body-lg text-content-secondary hover:text-content-primary">
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-md bg-primary px-6 py-2.5 text-body-lg font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
          >
            Get Started Free
          </Link>
        </nav>
      </header>

      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-8 py-24 text-center">
        <h1 className="text-display text-content-primary">Understand any NDA or MSA in 15 minutes, not 90</h1>
        <p className="max-w-xl text-body-lg text-content-secondary">
          ContractIQ extracts the key terms that matter, tells you exactly where they live in the document, and lets
          you ask follow-up questions in plain English — no lawyer on call required.
        </p>
        <Link
          href="/sign-up"
          className="rounded-md bg-primary px-8 py-3 text-body-lg font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
        >
          Get Started Free
        </Link>
        <p className="text-small text-content-muted">Not legal advice. Always verify critical terms with a qualified lawyer.</p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-8 pb-24 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-xl border border-border bg-surface-elevated p-6">
            <Icon size={24} strokeWidth={1.5} className="text-primary" />
            <h3 className="mt-4 text-h4 text-content-primary">{title}</h3>
            <p className="mt-2 text-body text-content-secondary">{description}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
