import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateProfileApi, changePasswordApi } from '../api/authApi'
import { getOrdersApi, cancelOrderApi } from '../api/orderApi'
import Loader from '../components/Loader'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', phone: '' })
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [pwdForm, setPwdForm] = useState({ old_password: '', new_password: '' })
  const [pwdSuccess, setPwdSuccess] = useState(false)
  const [pwdError, setPwdError] = useState('')
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
    } catch {}
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    shipped: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-600',
  }

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

        {/* Profile Tab */}
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
            {profileError && <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-red-700 text-sm font-medium">{profileError}</p></div>}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">First Name</label>
                  <input type="text" value={profileForm.first_name} onChange={(e) => setProfileForm((f) => ({ ...f, first_name: e.target.value }))}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Last Name</label>
                  <input type="text" value={profileForm.last_name} onChange={(e) => setProfileForm((f) => ({ ...f, last_name: e.target.value }))}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Email</label>
                <input type="email" value={user?.email || ''} disabled
                  className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Phone</label>
                <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black" placeholder="+91 9876543210" />
              </div>
              <button type="submit" disabled={profileLoading}
                className="w-full bg-black text-white py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-60 rounded-xl mt-2">
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Orders Tab */}
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
                    <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Order Number</p>
                        <p className="text-base font-black text-black">{order.order_number}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.status}
                        </span>
                        {['pending', 'confirmed'].includes(order.status) && (
                          <button onClick={() => handleCancelOrder(order.order_number)}
                            className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wide border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items?.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.product_name} {item.variant_name && `/ ${item.variant_name}`} × {item.quantity}</span>
                          <span className="font-bold">₹{parseFloat(item.line_total).toFixed(2)}</span>
                        </div>
                      ))}
                      {order.items?.length > 3 && <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="text-sm">
                        <span className="text-gray-400">Total: </span>
                        <span className="font-black text-black">₹{parseFloat(order.total).toFixed(2)}</span>
                      </div>
                      <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : order.payment_status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Password Tab */}
        {tab === 'password' && (
          <div className="bg-white rounded-2xl p-8 shadow-sm max-w-lg">
            <h2 className="text-lg font-black uppercase tracking-tight text-black mb-6">Change Password</h2>

            {pwdSuccess && <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl"><p className="text-green-700 text-sm font-medium">✓ Password changed successfully!</p></div>}
            {pwdError && <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl"><p className="text-red-700 text-sm font-medium">{pwdError}</p></div>}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Current Password</label>
                <input type="password" value={pwdForm.old_password} onChange={(e) => setPwdForm((f) => ({ ...f, old_password: e.target.value }))} required
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">New Password</label>
                <input type="password" value={pwdForm.new_password} onChange={(e) => setPwdForm((f) => ({ ...f, new_password: e.target.value }))} required minLength={8}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black" />
              </div>
              <button type="submit" disabled={pwdLoading}
                className="w-full bg-black text-white py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-60 rounded-xl mt-2">
                {pwdLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
