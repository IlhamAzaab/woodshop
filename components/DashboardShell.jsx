'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, LayoutDashboard, PackagePlus, Users, Shield, Menu, X, CheckSquare, DollarSign } from 'lucide-react'
import LogoutButton from './LogoutButton'

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/add-product', label: 'Add Product', icon: PackagePlus },
  { href: '/admin/manage-products', label: 'Manage Products', icon: BarChart3 },
  { href: '/admin/sales', label: 'Sales', icon: DollarSign },
]

const managerLinks = [
  { href: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/manager/review', label: 'Review', icon: CheckSquare },
  { href: '/manager/sales-approve', label: 'Sales Approve', icon: DollarSign },
  { href: '/manager/products', label: 'Products', icon: PackagePlus },
  { href: '/manager/admins', label: 'Admins', icon: Users },
  { href: '/manager/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function DashboardShell({ role, children }) {
  const pathname = usePathname()
  const links = role === 'manager' ? managerLinks : adminLinks
  const [isOpen, setIsOpen] = useState(false)
  const [pendingReview, setPendingReview] = useState(0)
  const [pendingSales, setPendingSales] = useState(0)

  // Close the sidebar when navigation happens
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Fetch pending counts for manager notifications
  useEffect(() => {
    if (role === 'manager') {
      const fetchCounts = () => {
        Promise.all([
          fetch('/api/products?all=true').then(r => r.json()),
          fetch('/api/sales?status=pending').then(r => r.json())
        ]).then(([prodData, salesData]) => {
          const prods = prodData.products || []
          const pProd = prods.filter(p => p.status === 'pending').length
          const pStock = prods.reduce((acc, p) => p.status === 'approved' ? acc + p.sizes.filter(s => s.stock_request > 0).length : acc, 0)
          setPendingReview(pProd + pStock)
          
          const sales = salesData.sales || []
          setPendingSales(sales.length)
        }).catch(() => {})
      }
      
      fetchCounts()
      const interval = setInterval(fetchCounts, 10000) // Poll every 10s
      return () => clearInterval(interval)
    }
  }, [role, pathname])

  return (
    <div className="min-h-screen bg-qasr-night text-qasr-beige lg:flex">
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/50 p-5 backdrop-blur-xl lg:hidden">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-qasr-gold">QASR</p>
          <h1 className="mt-1 font-display text-2xl text-white">
            {role === 'manager' ? 'Manager' : 'Admin'}
          </h1>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className="rounded-xl border border-white/10 p-2.5 transition hover:bg-white/5"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] transform flex-col border-r border-white/10 bg-[#0a0705] px-5 py-6 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">QASR</p>
            <h1 className="mt-2 font-display text-3xl text-white">
              {role === 'manager' ? 'Manager' : 'Admin'} Panel
            </h1>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full border border-white/10 p-2 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {links.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon
            
            let badgeCount = 0
            if (role === 'manager') {
              if (link.href === '/manager/review') badgeCount = pendingReview
              if (link.href === '/manager/sales-approve') badgeCount = pendingSales
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                  active
                    ? 'bg-qasr-gold text-qasr-night'
                    : 'text-qasr-beige/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  {link.label}
                </div>
                {badgeCount > 0 && (
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    active ? 'bg-qasr-night text-qasr-gold' : 'bg-qasr-gold text-qasr-night'
                  }`}>
                    {badgeCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-sm text-qasr-beige/75">
            <Shield size={16} className="text-qasr-gold" /> Secure Session
          </div>
          <p className="mt-3 text-xs leading-6 text-qasr-beige/60">
            Role-based access control is enforced securely.
          </p>
        </div>

        <div className="mt-8">
          <LogoutButton className="w-full justify-center" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-b from-[#120e0b] to-[#0d0a08] p-5 md:p-8">
        {children}
      </main>
    </div>
  )
}
