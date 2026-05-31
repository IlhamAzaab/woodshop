'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, LayoutDashboard, PackagePlus, Users, Shield, Menu } from 'lucide-react'
import LogoutButton from './LogoutButton'

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/add-product', label: 'Add Product', icon: PackagePlus },
  { href: '/admin/manage-products', label: 'Manage Products', icon: BarChart3 },
]

const managerLinks = [
  { href: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/manager/products', label: 'Products', icon: PackagePlus },
  { href: '/manager/admins', label: 'Admins', icon: Users },
  { href: '/manager/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function DashboardShell({ role, children }) {
  const pathname = usePathname()
  const links = role === 'manager' ? managerLinks : adminLinks

  return (
    <div className="min-h-screen bg-qasr-night text-qasr-beige">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-white/10 bg-black/30 px-5 py-6 backdrop-blur-xl">
          <div className="flex items-center justify-between lg:block">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">QASR</p>
              <h1 className="mt-2 font-display text-3xl text-white">
                {role === 'manager' ? 'Manager' : 'Admin'} Panel
              </h1>
            </div>
            <button type="button" className="rounded-full border border-white/10 p-2 lg:hidden">
              <Menu size={18} />
            </button>
          </div>

          <nav className="mt-8 space-y-2">
            {links.map((link) => {
              const active = pathname === link.href
              const Icon = link.icon

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    active
                      ? 'bg-qasr-gold text-qasr-night'
                      : 'text-qasr-beige/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm text-qasr-beige/75">
              <Shield size={16} className="text-qasr-gold" /> Secure Supabase Session
            </div>
            <p className="mt-3 text-xs leading-6 text-qasr-beige/60">
              Role-based access control is enforced on the server and middleware.
            </p>
          </div>

          <div className="mt-8">
            <LogoutButton className="w-full justify-center" />
          </div>
        </aside>

        <main className="bg-gradient-to-b from-[#120e0b] to-[#0d0a08] p-5 md:p-8">{children}</main>
      </div>
    </div>
  )
}
