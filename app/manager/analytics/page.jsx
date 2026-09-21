'use client'

import { useEffect, useState, useMemo } from 'react'
import { BarChart3, Loader2, Calendar } from 'lucide-react'

export default function AnalyticsPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30) // Default to last 30 days
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    setLoading(true)
    fetch('/api/sales?status=approved')
      .then(r => r.json())
      .then(d => setSales(d.sales || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Filter and Group Sales
  const { summary, dailySales } = useMemo(() => {
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const filtered = sales.filter(s => {
      const d = new Date(s.created_at)
      return d >= start && d <= end
    })

    const totalRevenue = filtered.reduce((acc, s) => acc + (s.final_price * s.quantity), 0)
    const totalItems = filtered.reduce((acc, s) => acc + s.quantity, 0)

    // Group by day (YYYY-MM-DD)
    const dailyMap = {}
    filtered.forEach(s => {
      const day = new Date(s.created_at).toISOString().split('T')[0]
      if (!dailyMap[day]) {
        dailyMap[day] = {
          date: day,
          revenue: 0,
          items: 0,
          sales: []
        }
      }
      dailyMap[day].revenue += (s.final_price * s.quantity)
      dailyMap[day].items += s.quantity
      dailyMap[day].sales.push(s)
    })

    const dailyArr = Object.values(dailyMap).sort((a, b) => b.date.localeCompare(a.date)) // descending

    return {
      summary: { totalRevenue, totalItems, orderCount: filtered.length },
      dailySales: dailyArr
    }
  }, [sales, startDate, endDate])

  const [expandedDay, setExpandedDay] = useState(null)

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-qasr-gold">Business Insights</p>
          <h1 className="mt-3 font-display text-4xl text-white">Sales Analytics</h1>
        </div>
        
        {/* Date Picker */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-2">
          <Calendar size={16} className="text-qasr-beige/50 ml-2" />
          <input 
            type="date" 
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-transparent text-sm text-white outline-none"
          />
          <span className="text-qasr-beige/50">to</span>
          <input 
            type="date" 
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-transparent text-sm text-white outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-qasr-gold" size={32} />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="luxe-panel p-6">
              <p className="text-sm text-qasr-beige/60">Total Revenue</p>
              <p className="mt-2 text-3xl font-display text-qasr-gold">₹{summary.totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="luxe-panel p-6">
              <p className="text-sm text-qasr-beige/60">Total Items Sold</p>
              <p className="mt-2 text-3xl font-display text-white">{summary.totalItems}</p>
            </div>
            <div className="luxe-panel p-6">
              <p className="text-sm text-qasr-beige/60">Total Orders</p>
              <p className="mt-2 text-3xl font-display text-white">{summary.orderCount}</p>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="luxe-panel p-6">
            <h2 className="text-lg font-medium text-white mb-6 border-b border-white/10 pb-4">Day-by-Day Breakdown</h2>
            
            {dailySales.length === 0 ? (
              <div className="text-center py-10 text-qasr-beige/50">
                <BarChart3 size={32} className="mx-auto mb-3 opacity-50" />
                No sales recorded in this period.
              </div>
            ) : (
              <div className="space-y-4">
                {dailySales.map(day => (
                  <div key={day.date} className="rounded-xl border border-white/5 bg-white/5 overflow-hidden">
                    {/* Day Header */}
                    <div 
                      className="flex cursor-pointer items-center justify-between p-4 transition hover:bg-white/5"
                      onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
                    >
                      <div>
                        <p className="font-medium text-white">
                          {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-qasr-beige/50">{day.items} items sold</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-qasr-gold">₹{day.revenue.toLocaleString('en-IN')}</p>
                        <p className="text-[10px] uppercase text-qasr-beige/50 tracking-wider">
                          {expandedDay === day.date ? 'Hide Details' : 'View Details'}
                        </p>
                      </div>
                    </div>

                    {/* Day Details */}
                    {expandedDay === day.date && (
                      <div className="border-t border-white/10 bg-black/20 p-4 space-y-3">
                        {day.sales.map((sale, i) => (
                          <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                            <div>
                              <p className="text-sm text-white">{sale.product?.name}</p>
                              <p className="text-xs text-qasr-beige/50">{sale.size?.size} · Qty: {sale.quantity}</p>
                            </div>
                            <p className="text-sm font-medium text-white">
                              ₹{(sale.final_price * sale.quantity).toLocaleString('en-IN')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
