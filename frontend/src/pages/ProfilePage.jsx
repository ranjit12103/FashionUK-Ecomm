import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateProfileApi, changePasswordApi } from '../api/authApi'
import { getOrdersApi, cancelOrderApi } from '../api/orderApi'
import Loader from '../components/Loader'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab]             = useState('profile')
  const [orders, setOrders]       = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [quickView, setQuickView] = useState(null)

  const [profileForm, setProfileForm]     = useState({ first_name: '', last_name: '', phone: '' })
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError]   = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  const [pwdForm, setPwdForm]     = useState({ old_password: '', new_password: '' })
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const [pwdError, setPwdError]   = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)

  useEffect(() => {
    if (user) setProfileForm({ first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || '' })
  }, [user])

  useEffect(() => {
    if (tab === 'orders') {
      setOrdersLoading(true)
      getOrdersApi().then(({ data }) => setOrders(data.results || data)).catch(() => {}).finally(() => setOrdersLoading(false))
    }
  }, [tab])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileError(''); setProfileSuccess(false); setProfileLoading(true)
    try {
      const { data } = await updateProfileApi(profileForm)
      updateUser(data)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) { setProfileError(err.response?.data?.detail || 'Update failed.') }
    finally { setProfileLoading(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPwdError(''); setPwdSuccess(false); setPwdLoading(true)
    try {
      await changePasswordApi(pwdForm)
      setPwdSuccess(true)
      setPwdForm({ old_password: '', new_password: '' })
    } catch (err) {
      const data = err.response?.data
      if (data?.old_password) setPwdError(Array.isArray(data.old_password) ? data.old_password[0] : data.old_password)
      else setPwdError(data?.detail || 'Failed to change password.')
    } finally { setPwdLoading(false) }
  }

  const handleCancelOrder = async (orderNumber) => {
    if (!confirm('Cancel this order?')) return
    try {
      const { data } = await cancelOrderApi(orderNumber)
      setOrders((prev) => prev.map((o) => o.order_number === orderNumber ? data : o))
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not cancel order.')
    }
  }

  const handleReturnOrder = (orderNumber) => {
    navigate('/contact', {
      state: { subject: 'return', message: `I would like to return items from order #${orderNumber}.` }
    })
  }

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

  const inputClass = 'w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black uppercase tracking-tight text-black mb-8">My Account</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-gray-200">
          {['profile', 'orders', 'password'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all -mb-px ${tab === t ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>
              {t === 'profile' ? 'My Profile' : t === 'orders' ? 'My Orders' : 'Change Password'}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ── */}
        {tab === 'profile' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm max-w-lg">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-black uppercase">
                {user?.first_name?.[0] || user?.email?.[0] || 'U'}
              </div>
              <div>
                <p className="text-lg font-black text-black">{user?.first_name ? `${user.first_name} ${user.last_name}` : 'Your Account'}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>

            {profileSuccess && <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl"><p className="text-green-700 text-sm font-medium">✓ Profile updated successfully!</p></div>}
            {profileError   && <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-red-700 text-sm font-medium">{profileError}</p></div>}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">First Name</label>
                  <input type="text" value={profileForm.first_name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, first_name: e.target.value }))}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Last Name</label>
                  <input type="text" value={profileForm.last_name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, last_name: e.target.value }))}
                    className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Email</label>
                <input type="email" value={user?.email || ''} disabled
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Phone</label>
                <input type="tel" value={profileForm.phone}
                  onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                  className={inputClass} placeholder="+91 9876543210" />
              </div>
              <button type="submit" disabled={profileLoading}
                className="w-full bg-black text-white py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-60 rounded-xl mt-2">
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* ── Orders Tab ── */}
        {tab === 'orders' && (
          <div>
            {ordersLoading ? <Loader size="lg" /> : orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-xl font-black uppercase text-black mb-2">No orders yet</h3>
                <p className="text-gray-400 text-sm">Your order history will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm p-6">

                    {/* Order header */}
                    <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Order Number</p>
                        <p className="text-base font-black text-black">{order.order_number}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>

                        {/* Cancel — pending or confirmed only */}
                        {['pending', 'confirmed'].includes(order.status) && (
                          <button onClick={() => handleCancelOrder(order.order_number)}
                            className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wide border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors">
                            Cancel
                          </button>
                        )}

                        {/* Return — delivered only */}
                        {order.status === 'delivered' && (
                          <button onClick={() => handleReturnOrder(order.order_number)}
                            className="text-xs text-purple-600 hover:text-purple-800 font-bold uppercase tracking-wide border border-purple-200 px-3 py-1.5 rounded-full hover:bg-purple-50 transition-colors">
                            Return Items
                          </button>
                        )}

                        {/* View full detail */}
                        <Link to={`/orders/${order.order_number}`}
                          className="text-xs text-black font-bold uppercase tracking-wide border border-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors">
                          View Details
                        </Link>
                      </div>
                    </div>

                    {/* Items with quick view */}
                    <div className="space-y-2 mb-4">
                      {order.items?.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm group">
                          <div className="flex items-center gap-3">
                            {item.product_image ? (
                              <img src={item.product_image} alt={item.product_name}
                                className="w-10 h-12 object-cover rounded-lg bg-gray-100 shrink-0" />
                            ) : (
                              <div className="w-10 h-12 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-gray-300 text-xs">?</div>
                            )}
                            <div>
                              <span className="text-gray-700 font-medium">
                                {item.product_name}{item.variant_name && ` / ${item.variant_name}`}
                              </span>
                              <span className="text-gray-400 ml-2">× {item.quantity}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold">₹{parseFloat(item.line_total).toFixed(2)}</span>
                            <button onClick={() => setQuickView(item)}
                              className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black border border-gray-200 hover:border-black px-2 py-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                              Quick View
                            </button>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="text-sm">
                        <span className="text-gray-400">Total: </span>
                        <span className="font-black text-black">₹{parseFloat(order.total).toFixed(2)}</span>
                      </div>
                      <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                        order.payment_status === 'paid'   ? 'bg-green-100 text-green-700' :
                        order.payment_status === 'failed' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-700'}`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Password Tab ── */}
        {tab === 'password' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm max-w-lg">
            <h2 className="text-lg font-black uppercase tracking-tight text-black mb-6">Change Password</h2>

            {pwdSuccess && <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl"><p className="text-green-700 text-sm font-medium">✓ Password changed successfully!</p></div>}
            {pwdError   && <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-red-700 text-sm font-medium">{pwdError}</p></div>}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Current Password</label>
                <input type="password" value={pwdForm.old_password}
                  onChange={(e) => setPwdForm((f) => ({ ...f, old_password: e.target.value }))} required
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">New Password</label>
                <input type="password" value={pwdForm.new_password}
                  onChange={(e) => setPwdForm((f) => ({ ...f, new_password: e.target.value }))} required minLength={8}
                  className={inputClass} />
              </div>
              <button type="submit" disabled={pwdLoading}
                className="w-full bg-black text-white py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-60 rounded-xl mt-2">
                {pwdLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Quick View Modal ── */}
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

            <div className="w-full h-52 bg-gray-100 rounded-xl overflow-hidden mb-5">
              {quickView.product_image ? (
                <img src={quickView.product_image} alt={quickView.product_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold uppercase tracking-widest">No Image</div>
              )}
            </div>

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
              {quickView.sku && <p className="text-[10px] text-gray-300 font-mono">SKU: {quickView.sku}</p>}
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
