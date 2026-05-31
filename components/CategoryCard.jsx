import { ArrowUpRight } from 'lucide-react'

export default function CategoryCard({ title }) {
  return (
    <article className="luxe-panel group flex items-center justify-between p-5 transition duration-300 hover:border-qasr-gold/40">
      <h3 className="font-display text-2xl text-white">{title}</h3>
      <ArrowUpRight className="text-qasr-gold transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </article>
  )
}
