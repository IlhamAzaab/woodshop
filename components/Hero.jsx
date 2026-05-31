'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="wrapper pt-8 md:pt-12">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/20" />

        <div className="relative min-h-[78vh] px-6 py-16 sm:px-10 md:px-16 md:py-24">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-xs uppercase tracking-[0.28em] text-qasr-gold"
          >
            Luxury Arabic Interiors
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08 }}
            className="max-w-3xl font-display text-5xl leading-tight text-white sm:text-6xl md:text-7xl"
          >
            Royal Living Begins Here
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18 }}
            className="mt-6 max-w-2xl text-base leading-8 text-qasr-beige/90 sm:text-lg"
          >
            Discover luxury Arabic-inspired furniture crafted for elegant
            modern homes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link href="/products" className="gold-button">
              Shop Now
            </Link>
            <Link href="/contact" className="ghost-button">
              Contact Us
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
