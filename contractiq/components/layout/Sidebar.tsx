'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, UploadCloud, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Review a Contract', icon: UploadCloud },
]

export function Sidebar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="flex h-screen w-[280px] shrink-0 flex-col bg-primary px-4 py-6">
      <Link href="/dashboard" className="px-2 text-h4 font-bold text-white">
        ContractIQ
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-body-lg transition-colors duration-150 ease-out',
                isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon size={18} strokeWidth={1.5} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-4">
        {userEmail && <p className="truncate px-2 text-small text-white/60">{userEmail}</p>}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-body-lg text-white/70 transition-colors duration-150 ease-out hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
