import { useState } from 'react'
import api from '../api/axiosInstance'

const SUBJECTS = [
  { value: '',         label: 'Select a subject...' },
  { value: 'order',    label: 'Order Issue' },
  { value: 'return',   label: 'Return & Refund' },
  { value: 'product',  label: 'Product Query' },
  { value: 'payment',  label: 'Payment Issue' },
  { value: 'shipping', label: 'Shipping Query' },
  { value: 'other',    label: 'Other' },
]

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.subject) { setError('Please select a subject.'); return }
    setLoading(true)
    try {
      await api.post('/contact/', form)
      setSuccess(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  const inputClass = 'w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-colors bg-gray-50 focus:bg-white'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-2">Contact Us</h1>
        <p className="text-gray-400 text-sm mb-10">
          We're here to help. Fill in the form and we'll get back to you within 24 hours.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — Info cards */}
          <div className="space-y-4">
            {[
              { icon: '📦', title: 'Orders & Returns',  desc: 'Issues with your order or want to return an item?' },
              { icon: '💳', title: 'Payments',          desc: 'Payment failed or charged incorrectly?' },
              { icon: '🚚', title: 'Shipping',          desc: 'Track your order or delivery queries.' },
              { icon: '👕', title: 'Products',          desc: 'Questions about sizing, materials, or availability.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-sm font-black uppercase tracking-wide text-black mb-1">{item.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}

            <div className="bg-black rounded-2xl p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Email Us</p>
              <p className="text-sm font-bold">support@fashionuk.com</p>
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">Mon – Sat, 10am to 6pm IST</p>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm">
            {success ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-xl font-black uppercase text-black mb-2">Message Sent!</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Thanks for reaching out. We'll get back to you within 24 hours.
                </p>
                <button onClick={() => setSuccess(false)}
                  className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors">
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-sm font-black uppercase tracking-widest text-black mb-6">Send a Message</h2>

                {error && (
                  <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-xs font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Your Name *</label>
                      <input type="text" value={form.name} onChange={set('name')} required
                        placeholder="John Smith" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Email Address *</label>
                      <input type="email" value={form.email} onChange={set('email')} required
                        placeholder="john@email.com" className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Subject *</label>
                    <select value={form.subject} onChange={set('subject')} className={inputClass}>
                      {SUBJECTS.map((s) => (
                        <option key={s.value} value={s.value} disabled={s.value === ''}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Message *</label>
                    <textarea value={form.message} onChange={set('message')} required rows={5}
                      placeholder="Tell us how we can help you..."
                      className={inputClass + ' resize-none'} />
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-60 rounded-xl flex items-center justify-center gap-2">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                    ) : 'Send Message →'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
