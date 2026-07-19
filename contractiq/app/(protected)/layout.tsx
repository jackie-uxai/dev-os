import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen bg-surface-subtle">
      <Sidebar userEmail={user?.email ?? null} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}
