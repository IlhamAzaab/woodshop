export default function ManagerAnalytics() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">Analytics</p>
        <h1 className="mt-3 font-display text-4xl text-white">Business Performance</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-qasr-beige/75">
          Track store activity, customer demand, and product engagement at a glance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {['Visitors', 'Sales', 'Conversion'].map((label) => (
          <div key={label} className="luxe-panel p-5">
            <p className="text-sm text-qasr-beige/70">{label}</p>
            <p className="mt-2 font-display text-3xl text-white">78%</p>
          </div>
        ))}
      </div>
    </section>
  )
}
