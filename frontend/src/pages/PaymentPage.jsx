import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { placeOrderApi } from '../api/orderApi'
import { createRazorpayOrderApi, verifyPaymentApi } from '../api/paymentApi'

export default function PaymentPage() {
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const couponCode = location.state?.coupon || ''

  const [form, setForm] = useState({
    full_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    county: '',
    postcode: '',
    country: 'India',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const subtotal = parseFloat(cart?.subtotal || 0)
  const shipping = subtotal >= 999 ? 0 : 99
  const total = subtotal + shipping

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!cart?.items?.length) { setError('Your cart is empty.'); return }
    setLoading(true)

    try {
      // 1. Place order on backend
      const { data: order } = await placeOrderApi({ ...form, coupon_code: couponCode })

      // 2. Create Razorpay order
      const { data: rzp } = await createRazorpayOrderApi(order.order_number)

      // 3. Load Razorpay SDK
      const loaded = await loadRazorpayScript()
      if (!loaded) { setError('Payment SDK failed to load. Please try again.'); setLoading(false); return }

      // 4. Open Razorpay modal
      const options = {
        key: rzp.razorpay_key_id,
        amount: rzp.amount,
        currency: rzp.currency,
        name: 'FashionUK',
        description: `Order #${order.order_number}`,
        order_id: rzp.razorpay_order_id,
        prefill: { name: form.full_name, email: form.email, contact: form.phone },
        theme: { color: '#111111' },
        handler: async (response) => {
          try {
            await verifyPaymentApi({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            await clearCart()
            navigate(`/orders/${order.order_number}`, { state: { success: true } })
          } catch {
            navigate(`/orders/${order.order_number}`, { state: { paymentFailed: true } })
          }
        },
        modal: {
          ondismiss: () => { setLoading(false) },
        },
      }
      new window.Razorpay(options).open()
    } catch (err) {
      const data = err.response?.data
      setError(data?.detail || JSON.stringify(data) || 'Failed to place order. Please try again.')
      setLoading(false)
    }
  }

  const inputClass = 'w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-colors bg-gray-50 focus:bg-white'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Address form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-sm font-black uppercase tracking-widest text-black mb-5">Delivery Address</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Full Name *</label>
                      <input type="text" value={form.full_name} onChange={set('full_name')} required className={inputClass} placeholder="John Smith" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Phone</label>
                      <input type="tel" value={form.phone} onChange={set('phone')} className={inputClass} placeholder="+91 9876543210" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Email *</label>
                    <input type="email" value={form.email} onChange={set('email')} required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Address Line 1 *</label>
                    <input type="text" value={form.address_line1} onChange={set('address_line1')} required className={inputClass} placeholder="Street address, house number" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Address Line 2</label>
                    <input type="text" value={form.address_line2} onChange={set('address_line2')} className={inputClass} placeholder="Apartment, floor, etc. (optional)" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">City *</label>
                      <input type="text" value={form.city} onChange={set('city')} required className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">State</label>
                      <input type="text" value={form.county} onChange={set('county')} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Postcode *</label>
                      <input type="text" value={form.postcode} onChange={set('postcode')} required className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widests mb-2">Country</label>
                      <input type="text" value={form.country} onChange={set('country')} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Order Notes</label>
                    <textarea value={form.notes} onChange={set('notes')} rows={2} className={inputClass} placeholder="Any special instructions..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm h-fit">
              <h2 className="text-sm font-black uppercase tracking-widest text-black mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5">
                {cart?.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate max-w-[160px]">{item.product.name} × {item.quantity}</span>
                    <span className="font-bold ml-2">₹{parseFloat(item.line_total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-bold">₹{subtotal.toFixed(2)}</span></div>
                {couponCode && <div className="flex justify-between text-green-600"><span>Coupon ({couponCode})</span><span className="font-bold">Applied ✓</span></div>}
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className={`font-bold ${shipping === 0 ? 'text-green-600' : ''}`}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                <div className="flex justify-between pt-2 border-t border-gray-100 text-base">
                  <span className="font-black uppercase">Total</span>
                  <span className="font-black">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-xs font-medium">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading || !cart?.items?.length}
                className="w-full mt-5 bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-60 rounded-xl flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : 'Pay with Razorpay →'}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4">
                {['UPI', 'Visa', 'MC', 'Netbanking'].map((m) => (
                  <span key={m} className="text-[9px] border border-gray-200 px-2 py-0.5 text-gray-400 font-bold uppercase rounded">{m}</span>
                ))}
              </div>

              <Link to="/cart" className="block text-center mt-3 text-xs text-gray-400 hover:text-black transition-colors no-underline">← Back to Cart</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
