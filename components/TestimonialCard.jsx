import Image from 'next/image'
import { Star } from 'lucide-react'

export default function TestimonialCard({ testimonial }) {
  return (
    <article className="luxe-panel p-6">
      <div className="mb-4 flex items-center gap-4">
        <div className="relative h-14 w-14 overflow-hidden rounded-full">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div>
          <p className="font-medium text-white">{testimonial.name}</p>
          <div className="mt-1 flex gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={14}
                className={
                  index < testimonial.rating
                    ? 'fill-qasr-gold text-qasr-gold'
                    : 'text-white/20'
                }
              />
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm leading-7 text-qasr-beige/80">{testimonial.review}</p>
    </article>
  )
}
