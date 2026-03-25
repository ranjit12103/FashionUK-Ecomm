import { useState, useEffect } from 'react'
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom'
import { getOrderDetailApi, cancelOrderApi } from '../api/orderApi'
import Loader from '../components/Loader'

const statusColors = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped:    'bg-cyan-100 text-cyan-700',
  delivered:  'bg-green-100 text-green-700',
  completed:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-600',
}

const statusSteps = ['pending', 'confirmed', 'shipped', 'delivered']

export default function OrderDetailPage() {
  const { orderNumber } = useParams()
  const location        = useLocation()
  const navigate        = useNavigate()

  const [order, setOrder]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [quickView, setQuickView] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError]         = useState('')

  const isSuccess = location.state?.success

  useEffect(() => {
    setLoading(true)
    getOrderDetailApi(orderNumber)
      .then(({ data }) => setOrder(data))
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false))
  }, [orderNumber])

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    setCancelling(true)
    try {
      const { data } = await cancelOrderApi(orderNumber)
      setOrder(data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not cancel order.')
    } finally { setCancelling(false) }
  }

  const handleReturn = () => {
    navigate('/contact', {
      state: { subject: 'return', message: `I would like to return items from order #${orderNumber}.` }
    })
  }

  const currentStep = statusSteps.indexOf(order?.status)

  if (loading) return <Loader fullScreen />
  if (error)   return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">{error}</p>
        <Link to="/orders" className="text-sm font-bold uppercase tracking-widest text-black underline">← Back to Orders</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Success banner */}
        {isSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-black text-green-800">Payment successful! Your order is confirmed.</p>
              <p className="text-xs text-green-600 mt-0.5">A confirmation email has been sent to you.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link to="/orders" className="text-xs text-gray-400 hover:text-black font-bold uppercase tracking-widest transition-colors">
              ← My Orders
            </Link>
            <h1 className="text-2xl font-black uppercase tracking-tight text-black mt-1">
              Order #{order?.order_number}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Placed on {new Date(order?.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${statusColors[order?.status] || 'bg-gray-100 text-gray-600'}`}>
              {order?.status}
            </span>
            <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full ${
              order?.payment_status === 'paid'   ? 'bg-green-100 text-green-700' :
              order?.payment_status === 'failed' ? 'bg-red-100 text-red-600' :
              'bg-yellow-100 text-yellow-700'}`}>
              {order?.payment_status}
            </span>
          </div>
        </div>

        {/* Progress tracker — only for non-cancelled orders */}
        {!['cancelled', 'refunded'].includes(order?.status) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Order Progress</p>
            <div className="flex items-center">
              {statusSteps.map((step, idx) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      idx <= currentStep ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {idx < currentStep ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : idx + 1}
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1.5 ${idx <= currentStep ? 'text-black' : 'text-gray-300'}`}>
                      {step}
                    </p>
                  </div>
                  {idx < statusSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${idx < currentStep ? 'bg-black' : 'bg-gray-100'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
                Items Ordered ({order?.items?.length})
              </p>

              <div className="space-y-4">
                {order?.items?.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0 group">
                    {/* Image */}
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {item.product_image ? (
                        <img src={item.product_image} alt={item.product_name}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200 text-xs">?</div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-black leading-tight">{item.product_name}</p>
                      {item.variant_name && (
                        <p className="text-xs text-gray-400 mt-0.5">{item.variant_name}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
                      {item.sku && (
                        <p className="text-[10px] text-gray-300 font-mono mt-0.5">SKU: {item.sku}</p>
                      )}
                    </div>

                    {/* Price + Quick View */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-black">₹{parseFloat(item.line_total).toFixed(2)}</p>
                      {parseFloat(item.unit_savings || 0) > 0 && (
                        <p className="text-xs text-green-600 font-medium mt-0.5">
                          Saved ₹{(parseFloat(item.unit_savings) * item.quantity).toFixed(2)}
                        </p>
                      )}
                      <button onClick={() => setQuickView(item)}
                        className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black border border-gray-200 hover:border-black px-2 py-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        Quick View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              {['pending', 'confirmed'].includes(order?.status) && (
                <button onClick={handleCancel} disabled={cancelling}
                  className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50">
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
              {order?.status === 'delivered' && (
                <button onClick={handleReturn}
                  className="flex-1 border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-400 py-3 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors">
                  Return Items
                </button>
              )}
              <Link to="/shop"
                className="flex-1 text-center bg-black text-white py-3 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="space-y-4">

            {/* Pricing */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Order Summary</p>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">₹{parseFloat(order?.subtotal || 0).toFixed(2)}</span>
                </div>
                {parseFloat(order?.discount_amount || 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount{order?.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                    <span className="font-bold">−₹{parseFloat(order.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className={`font-bold ${parseFloat(order?.shipping_cost || 0) === 0 ? 'text-green-600' : ''}`}>
                    {parseFloat(order?.shipping_cost || 0) === 0 ? 'FREE' : `₹${parseFloat(order.shipping_cost).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100 text-base">
                  <span className="font-black uppercase">Total</span>
                  <span className="font-black">₹{parseFloat(order?.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Delivering To</p>
              <p className="text-sm font-black text-black">{order?.full_name}</p>
              <p className="text-xs text-gray-500 leading-relaxed mt-1">
                {order?.address_line1}{order?.address_line2 ? `, ${order.address_line2}` : ''}<br />
                {order?.city}{order?.county ? `, ${order.county}` : ''}<br />
                {order?.postcode}, {order?.country}
              </p>
              {order?.phone && (
                <p className="text-xs text-gray-400 mt-2">📞 {order.phone}</p>
              )}
            </div>

            {/* Need help */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Need Help?</p>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                Issue with this order? Our team is here to help.
              </p>
              <Link to="/contact"
                className="block text-center border-2 border-gray-200 text-black py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl hover:border-black transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setQuickView(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}>

            <div className="flex justify-between items-center mb-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-black">Product Details</h3>
              <button onClick={() => setQuickView(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-black text-lg">
                ✕
              </button>
            </div>

            {/* Image */}
            <div className="w-full h-52 bg-gray-100 rounded-xl overflow-hidden mb-5">
              {quickView.product_image ? (
                <img src={quickView.product_image} alt={quickView.product_name}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold uppercase tracking-widest">
                  No Image
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Product</p>
                <p className="text-sm font-black text-black">{quickView.product_name}</p>
              </div>
              {quickView.variant_name && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Variant</p>
                  <p className="text-sm font-bold text-black">{quickView.variant_name}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Qty</p>
                  <p className="text-sm font-black text-black">{quickView.quantity}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Unit Price</p>
                  <p className="text-sm font-black text-black">₹{parseFloat(quickView.unit_price).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Total</p>
                  <p className="text-sm font-black text-black">₹{parseFloat(quickView.line_total).toFixed(2)}</p>
                </div>
              </div>
              {parseFloat(quickView.unit_savings || 0) > 0 && (
                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                  <p className="text-xs font-bold text-green-700">
                    ✓ Saved ₹{(parseFloat(quickView.unit_savings) * quickView.quantity).toFixed(2)} on this item
                  </p>
                </div>
              )}
              {quickView.sku && (
                <p className="text-[10px] text-gray-300 font-mono">SKU: {quickView.sku}</p>
              )}
            </div>

            <button onClick={() => setQuickView(null)}
              className="w-full mt-5 border-2 border-gray-200 text-black py-3 text-xs font-bold uppercase tracking-widest rounded-xl hover:border-black transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
