import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { if (isLoggedIn) navigate('/') }, [isLoggedIn])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      if (data?.detail) setError(data.detail)
      else if (data?.non_field_errors) setError(data.non_field_errors[0])
      else setError('Invalid email or password.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '40px 40px' }} className="absolute inset-0 opacity-100" />
        <div className="absolute inset-0 flex flex-col justify-end p-16 z-10">
          <p className="text-gray-500 text-xs uppercase tracking-[0.4em] mb-4">Premium Menswear</p>
          <h2 className="text-white font-black text-6xl uppercase leading-none tracking-tighter mb-6">
            Dress<br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1.5px white' }}>Better.</span>
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Explore the finest UK menswear — premium quality, modern fits, delivered to your door.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <Link to="/" className="text-2xl font-black uppercase tracking-tighter text-black">FashionUK</Link>
            <h1 className="mt-8 text-3xl font-black text-black uppercase tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-2">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-red-500 text-lg">⚠</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Email Address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-black transition-colors bg-gray-50 focus:bg-white" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest">Password</label>
                <a href="#" className="text-xs text-gray-500 hover:text-black font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-4 pr-12 py-3.5 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-black transition-colors bg-gray-50 focus:bg-white" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors text-sm">
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing In...</>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-black hover:underline underline-offset-2">Create Account →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
