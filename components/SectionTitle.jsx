export default function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-10 max-w-3xl">
      {eyebrow ? (
        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-qasr-gold">{eyebrow}</p>
      ) : null}
      <h2 className="font-display text-4xl leading-tight text-white md:text-5xl">{title}</h2>
      {subtitle ? <p className="mt-4 text-qasr-beige/80">{subtitle}</p> : null}
    </div>
  )
}
