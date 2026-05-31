'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/#categories', label: 'Categories' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/35 backdrop-blur-xl">
      <nav className="wrapper flex h-20 items-center justify-between">
        <Link href="/" className="font-display text-2xl tracking-[0.25em] text-qasr-gold">
          QASR
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const active =
              (link.href === '/' && pathname === '/') ||
              (link.href !== '/' && link.href !== '/#categories' && pathname.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wide transition ${
                  active ? 'text-qasr-gold' : 'text-qasr-beige/85 hover:text-qasr-gold'
                }`}
              >
                {link.label}
              </Link>
            )
          })}

          <button
            type="button"
            aria-label="Search"
            className="rounded-full border border-white/15 p-2.5 text-qasr-beige/85 transition hover:border-qasr-gold/60 hover:text-qasr-gold"
          >
            <Search size={18} />
          </button>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-full border border-white/15 p-2.5 text-qasr-beige lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            className="border-t border-white/10 bg-qasr-charcoal/95 lg:hidden"
          >
            <div className="wrapper flex flex-col py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm text-qasr-beige/90 transition hover:bg-white/10 hover:text-qasr-gold"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
