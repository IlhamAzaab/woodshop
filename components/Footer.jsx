import Link from 'next/link'
import { Facebook, Instagram, MapPin, Phone, Send } from 'lucide-react'

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-black/40 py-14">
      <div className="wrapper grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="font-display text-3xl tracking-[0.2em] text-qasr-gold">QASR</h3>
          <p className="mt-4 text-sm leading-7 text-qasr-beige/75">
            Premium Arabic-inspired furniture for modern elegant homes.
          </p>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Quick Links</h4>
          <div className="space-y-3 text-sm text-qasr-beige/80">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block hover:text-qasr-gold">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Contact</h4>
          <div className="space-y-3 text-sm text-qasr-beige/80">
            <p className="flex items-center gap-2">
              <MapPin size={16} className="text-qasr-gold" /> Dubai, UAE
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} className="text-qasr-gold" /> +971 50 123 4567
            </p>
            <p className="flex items-center gap-2">
              <Send size={16} className="text-qasr-gold" /> hello@qasrhome.com
            </p>
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Follow Us</h4>
          <div className="flex items-center gap-3">
            {[Instagram, Facebook].map((Icon, index) => (
              <button
                key={index}
                type="button"
                className="rounded-full border border-white/15 p-3 text-qasr-beige transition hover:border-qasr-gold/60 hover:text-qasr-gold"
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-12 text-center text-xs tracking-wide text-qasr-beige/60">
        © {new Date().getFullYear()} QASR. All rights reserved.
      </p>
    </footer>
  )
}
