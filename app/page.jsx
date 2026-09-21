export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { Check, Sparkles, Truck } from 'lucide-react'
import Hero from '../components/Hero'
import ProductCard from '../components/ProductCard'
import SectionTitle from '../components/SectionTitle'
import TestimonialCard from '../components/TestimonialCard'
import { getApprovedProducts } from '../lib/supabase'
import { getCategories } from '../lib/supabase'
import { testimonials, whyChoose } from '../lib/products'
import CategoryCard from '../components/CategoryCard'

const featureIcons = [Sparkles, Check, Sparkles, Truck, Check]

export default async function Page() {
  const products = await getApprovedProducts()
  const categories = await getCategories()

  return (
    <main className="pb-4">
      <Hero />

      {products.length > 0 && (
        <section className="wrapper mt-20">
          <SectionTitle
            eyebrow="Our Products"
            title="Crafted Furniture for Refined Living"
            subtitle="Handcrafted pieces — quality verified and priced by our team."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section id="categories" className="wrapper mt-20 scroll-mt-24">
        <SectionTitle
          eyebrow="Categories"
          title="Find Furniture by Space"
          subtitle="A curated range for every corner of your modern home."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} title={category.name} />
          ))}
        </div>
      </section>

      <section className="wrapper mt-20">
        <SectionTitle
          eyebrow="Why QASR"
          title="Why Choose QASR"
          subtitle="Each detail is designed to reflect modern luxury with Arabic soul."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {whyChoose.map((item, index) => {
            const Icon = featureIcons[index % featureIcons.length]
            return (
              <article key={item} className="luxe-panel flex items-start gap-4 p-5">
                <span className="rounded-xl bg-qasr-gold/15 p-2.5 text-qasr-gold">
                  <Icon size={18} />
                </span>
                <div>
                  <h3 className="text-lg font-medium text-white">{item}</h3>
                  <p className="mt-1 text-sm leading-7 text-qasr-beige/70">
                    Designed to elevate your space with comfort, elegance, and lasting style.
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="wrapper mt-20">
        <SectionTitle
          eyebrow="Customer Stories"
          title="Testimonials"
          subtitle="What our valued clients say about their QASR experience."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      </section>

      <section className="wrapper mt-20">
        <div className="luxe-panel flex flex-col items-start justify-between gap-6 px-7 py-10 md:flex-row md:items-center md:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-qasr-gold">Get In Touch</p>
            <h2 className="mt-3 font-display text-3xl text-white md:text-4xl">
              Transform Your Home with QASR
            </h2>
          </div>
          <Link href="/contact" className="gold-button">
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  )
}
