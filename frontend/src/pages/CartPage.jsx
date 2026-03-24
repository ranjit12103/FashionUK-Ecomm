import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CartItem from '../components/CartItem'
import Loader from '../components/Loader'
import { useCart } from '../context/CartContext'
import { validateCouponApi } from '../api/offerApi'

export default function CartPage() {
  const { cart, loading, clearCart } = useCart()
  const [coupon, setCoupon] = useState('')
  const [couponData, setCouponData] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const navigate = useNavigate()

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    setCouponError('')
    setCouponData(null)
    setCouponLoading(true)
    try {
      const { data } = await validateCouponApi(coupon.trim().toUpperCase(), cart?.subtotal || 0)
      setCouponData(data)
    } catch (err) {
      setCouponError(err.response?.data?.detail || 'Invalid coupon code.')
    } finally { setCouponLoading(false) }
  }

  const handleCheckout = () => {
    navigate('/payment', { state: { coupon: couponData?.coupon?.code || '' } })
  }

  if (loading) return <Loader fullScreen />

  const subtotal = parseFloat(cart?.subtotal || 0)
  const savings = parseFloat(cart?.total_savings || 0)
  const couponDiscount = couponData ? parseFloat(couponData.discount_amount || 0) : 0
  const shipping = subtotal >= 999 ? 0 : 99
  const total = subtotal - couponDiscount + shipping

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-8">Your Bag</h1>

        {!cart?.items?.length ? (
          <div className="text-center py-24 bg-white rounded-2xl">
            <div className="text-6xl mb-6">🛍</div>
            <h2 className="text-2xl font-black uppercase text-black mb-3">Your bag is empty</h2>
            <p className="text-gray-400 mb-8">Add some items to get started</p>
            <Link to="/shop" className="inline-block bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors no-underline rounded-xl">
              Continue Shopping →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{cart.total_items} item{cart.total_items !== 1 ? 's' : ''}</p>
                <button onClick={clearCart} className="text-xs text-gray-400 hover:text-red-600 transition-colors font-bold uppercase tracking-wide">Clear All</button>
              </div>
              {cart.items.map((item) => <CartItem key={item.id} item={item} />)}
            </div>

            {/* Summary */}
            <div className="space-y-4">
              {/* Coupon */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-black mb-4">Coupon Code</h3>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input type="text" placeholder="Enter code" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-black uppercase font-bold tracking-widest" />
                  <button type="submit" disabled={couponLoading || !coupon}
                    className="bg-black text-white px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 rounded-xl whitespace-nowrap">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </form>
                {couponError && <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>}
                {couponData && (
                  <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-green-700 text-xs font-bold">✓ {couponData.coupon.description || 'Coupon applied!'}</p>
                    <p className="text-green-600 text-xs mt-0.5">You save ₹{parseFloat(couponData.discount_amount).toFixed(2)}</p>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-black mb-5">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-medium">Sale savings</span>
                      <span className="font-bold">−₹{savings.toFixed(2)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-medium">Coupon ({coupon})</span>
                      <span className="font-bold">−₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping</span>
                    <span className={`font-bold ${shipping === 0 ? 'text-green-600' : ''}`}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  {subtotal < 999 && <p className="text-xs text-gray-400">Add ₹{(999 - subtotal).toFixed(2)} more for free shipping</p>}
                  <div className="flex justify-between pt-3 border-t border-gray-100 text-base">
                    <span className="font-black uppercase tracking-wide">Total</span>
                    <span className="font-black">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <button onClick={handleCheckout}
                  className="w-full mt-5 bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors rounded-xl">
                  Proceed to Checkout →
                </button>

                <Link to="/shop" className="block text-center mt-3 text-xs text-gray-400 hover:text-black transition-colors no-underline font-medium">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
