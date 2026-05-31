import Image from 'next/image'
import SectionTitle from '../../components/SectionTitle'

export default function AboutPage() {
  return (
    <main className="wrapper pb-6 pt-10">
      <SectionTitle
        eyebrow="Our Story"
        title="About QASR"
        subtitle="Where Arabic heritage meets modern interior elegance."
      />

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="luxe-panel p-7 sm:p-9">
          <p className="text-sm leading-8 text-qasr-beige/80">
            QASR was founded to bring refined Arabic-inspired furniture to modern
            homes. We blend handcrafted detail, premium materials, and elegant
            silhouettes to create interiors that feel timeless and elevated.
          </p>
          <p className="mt-5 text-sm leading-8 text-qasr-beige/80">
            Every collection is curated for comfort, durability, and artistic
            expression. From majlis spaces to contemporary living rooms, QASR
            delivers statement pieces with luxurious soul.
          </p>
        </div>

        <div className="luxe-panel relative min-h-[320px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1617104551722-3b2d5136649d?auto=format&fit=crop&w=1400&q=80"
            alt="Luxury QASR furniture showroom"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </section>
    </main>
  )
}
