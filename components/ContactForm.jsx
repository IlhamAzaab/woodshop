'use client'

import { useState } from 'react'

const initialState = {
  name: '',
  email: '',
  message: '',
}

export default function ContactForm() {
  const [form, setForm] = useState(initialState)
  const [status, setStatus] = useState({ type: 'idle', message: '' })

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus({ type: 'loading', message: 'Sending your message...' })

    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      setStatus({ type: 'error', message: data.message || 'Failed to send message.' })
      return
    }

    setForm(initialState)
    setStatus({ type: 'success', message: data.message || 'Message sent successfully.' })
  }

  return (
    <form className="luxe-panel space-y-4 p-7 sm:p-9" onSubmit={handleSubmit}>
      <input
        type="text"
        value={form.name}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        placeholder="Your Name"
        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none placeholder:text-qasr-beige/50 focus:border-qasr-gold/50"
      />
      <input
        type="email"
        value={form.email}
        onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        placeholder="Email Address"
        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none placeholder:text-qasr-beige/50 focus:border-qasr-gold/50"
      />
      <textarea
        rows="5"
        value={form.message}
        onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
        placeholder="Tell us about your furniture needs"
        className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none placeholder:text-qasr-beige/50 focus:border-qasr-gold/50"
      />

      <button type="submit" className="gold-button w-full" disabled={status.type === 'loading'}>
        {status.type === 'loading' ? 'Sending...' : 'Send Message'}
      </button>

      {status.type !== 'idle' ? (
        <p
          className={`text-sm ${
            status.type === 'error' ? 'text-red-300' : 'text-emerald-300'
          }`}
        >
          {status.message}
        </p>
      ) : null}
    </form>
  )
}
