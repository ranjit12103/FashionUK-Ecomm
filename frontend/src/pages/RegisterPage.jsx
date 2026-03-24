import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', password2: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState({})
  const [loading, setLoading] = useState(false)

  const { register, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (isLoggedIn) navigate('/') }, [isLoggedIn])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const getStrength = (pwd) => {
    if (!pwd) return null
    if (pwd.length < 6) return { label: 'Too Short', color: 'bg-red-500', w: 'w-1/4' }
    if (pwd.length < 8) return { label: 'Weak', color: 'bg-orange-400', w: 'w-2/4' }
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: 'Fair', color: 'bg-yellow-400', w: 'w-3/4' }
    return { label: 'Strong', color: 'bg-green-500', w: 'w-full' }
  }
  const strength = getStrength(form.password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError({})
    if (form.password !== form.password2) {
      setError({ password2: 'Passwords do not match.' })
      return
    }
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      if (data) setError(data)
      else setError({ non_field_errors: 'Registration failed. Please try again.' })
    } finally { setLoading(false) }
  }

  const inputClass = (field) =>
    `w-full px-4 py-3.5 border-2 rounded-xl text-sm outline-none transition-all bg-gray-50 focus:bg-white ${error[field] ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-black'}`

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '40px 40px' }} className="absolute inset-0" />
        <div className="absolute inset-0 flex flex-col justify-end p-16 z-10">
          <p className="text-gray-500 text-xs uppercase tracking-[0.4em] mb-4">Join FashionUK</p>
          <h2 className="text-white font-black text-6xl uppercase leading-none tracking-tighter mb-6">
            Style<br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1.5px white' }}>Starts<br />Here.</span>
          </h2>
          <ul className="space-y-3">
            {['Free delivery on orders over ₹999', 'Exclusive member-only deals', 'Easy returns within 30 days', 'Track orders in real time'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="text-green-400 text-sm">✓</span>
                <span className="text-gray-400 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="text-2xl font-black uppercase tracking-tighter text-black">FashionUK</Link>
            <h1 className="mt-8 text-3xl font-black text-black uppercase tracking-tight">Create Account</h1>
            <p className="text-gray-500 text-sm mt-2">Join thousands who shop smarter</p>
          </div>

          {(error.non_field_errors || error.detail) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium">{error.non_field_errors || error.detail}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">First Name</label>
                <input type="text" placeholder="John" value={form.first_name} onChange={set('first_name')} required className={inputClass('first_name')} />
                {error.first_name && <p className="mt-1 text-xs text-red-500">{Array.isArray(error.first_name) ? error.first_name[0] : error.first_name}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Last Name</label>
                <input type="text" placeholder="Smith" value={form.last_name} onChange={set('last_name')} required className={inputClass('last_name')} />
                {error.last_name && <p className="mt-1 text-xs text-red-500">{Array.isArray(error.last_name) ? error.last_name[0] : error.last_name}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required className={inputClass('email')} />
              {error.email && <p className="mt-1 text-xs text-red-500">{Array.isArray(error.email) ? error.email[0] : error.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={set('password')} required className={`${inputClass('password')} pr-12`} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-sm">
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
              {form.password && strength && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strength.color} ${strength.w}`} />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${strength.label === 'Strong' ? 'text-green-600' : strength.label === 'Fair' ? 'text-yellow-600' : 'text-red-500'}`}>{strength.label}</p>
                </div>
              )}
              {error.password && <p className="mt-1 text-xs text-red-500">{Array.isArray(error.password) ? error.password[0] : error.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Confirm Password</label>
              <input type="password" placeholder="Repeat your password" value={form.password2} onChange={set('password2')} required className={inputClass('password2')} />
              {error.password2 && <p className="mt-1 text-xs text-red-500">{error.password2}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
              ) : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-black hover:underline underline-offset-2">Sign In →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
