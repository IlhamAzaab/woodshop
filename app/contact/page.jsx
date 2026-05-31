import { Mail, MapPin, Phone } from 'lucide-react'
import SectionTitle from '../../components/SectionTitle'
import ContactForm from '../../components/ContactForm'

export default function ContactPage() {
  return (
    <main className="wrapper pb-6 pt-10">
      <SectionTitle
        eyebrow="Contact"
        title="Let Us Design Your Next Space"
        subtitle="Reach out and our team will help you find the perfect QASR pieces."
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="luxe-panel space-y-5 p-7 sm:p-9">
          <h2 className="font-display text-3xl text-white">Get in touch</h2>

          <div className="space-y-4 text-sm text-qasr-beige/80">
            <p className="flex items-center gap-3">
              <MapPin className="text-qasr-gold" size={17} /> Downtown, Dubai, UAE
            </p>
            <p className="flex items-center gap-3">
              <Phone className="text-qasr-gold" size={17} /> +971 50 123 4567
            </p>
            <p className="flex items-center gap-3">
              <Mail className="text-qasr-gold" size={17} /> hello@qasrhome.com
            </p>
          </div>
        </div>

        <ContactForm />
      </section>
    </main>
  )
}
