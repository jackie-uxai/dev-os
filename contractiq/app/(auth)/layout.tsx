import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-subtle px-4 py-12">
      <Link href="/" className="mb-8 text-h3 font-bold text-primary">
        ContractIQ
      </Link>
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface-elevated p-8">{children}</div>
    </main>
  )
}
