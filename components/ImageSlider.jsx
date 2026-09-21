'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Package } from 'lucide-react'

export default function ImageSlider({ images, alt = 'Product Image' }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black/30 text-qasr-beige/30">
        <Package size={32} />
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className="relative h-full w-full bg-black/30">
        <img
          src={images[0]}
          alt={alt}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  function nextImage(e) {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  function prevImage(e) {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="group relative h-full w-full bg-black/30">
      <img
        src={images[currentIndex]}
        alt={`${alt} - Image ${currentIndex + 1}`}
        className="h-full w-full object-cover"
      />
      
      {/* Arrows */}
      <button
        onClick={prevImage}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={nextImage}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === currentIndex ? 'w-4 bg-qasr-gold' : 'w-1.5 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
