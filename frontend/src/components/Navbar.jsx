import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const navLinks = [
  { label: 'Sale', href: '/shop?filter=sale', highlight: true },
  { label: 'New In', href: '/shop?filter=new' },
  { label: 'Clothing', href: '/shop' },
  { label: 'Best Sellers', href: '/shop?filter=bestseller' },
  { label: 'Brands', href: '/shop' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const { user, isLoggedIn, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('#user-menu')) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    setUserMenuOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-black text-white text-[11px] text-center py-2 tracking-[0.2em] uppercase font-medium">
        🚚 Free delivery on orders above ₹999 — New Season Now Live
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 bg-white border-b transition-shadow duration-300 ${scrolled ? 'shadow-md border-gray-200' : 'border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between h-16">

          {/* Mobile toggle */}
          <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            <div className="w-5 flex flex-col gap-1">
              <span className={`block h-0.5 bg-black transition-all ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 bg-black transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-black transition-all ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>

          {/* Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 text-xl font-black uppercase tracking-tighter text-black no-underline">
            FashionUK
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.href}
                className={`text-xs font-bold uppercase tracking-widest transition-colors pb-0.5 border-b-2 ${link.highlight ? 'text-red-600 border-red-600' : 'text-gray-800 border-transparent hover:text-black hover:border-black'}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center border-b-2 border-black">
                <input autoFocus type="text" placeholder="Search..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => { if (!searchQuery) setSearchOpen(false) }}
                  className="text-sm outline-none w-40 pb-1 bg-transparent" />
                <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                  className="ml-1 pb-1 text-gray-500 hover:text-black text-sm">✕</button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            )}

            {/* Wishlist */}
            <Link to={isLoggedIn ? '/wishlist' : '/login'} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{itemCount}</span>
              )}
            </Link>

            {/* User */}
            <div id="user-menu" className="relative">
              {isLoggedIn ? (
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user?.first_name?.[0] || user?.email?.[0] || 'U'}
                </button>
              ) : (
                <Link to="/login" className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="hidden lg:block text-xs font-bold uppercase tracking-wide">Login</span>
                </Link>
              )}

              {/* Dropdown */}
              {isLoggedIn && userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-bold text-black truncate">{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    {[
                      { label: 'My Profile', href: '/profile' },
                      { label: 'My Orders', href: '/orders' },
                      { label: 'Wishlist', href: '/wishlist' },
                    ].map((item) => (
                      <Link key={item.label} to={item.href} onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.href} onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 text-sm font-bold uppercase tracking-wider rounded-lg ${link.highlight ? 'text-red-600 bg-red-50' : 'text-gray-800 hover:bg-gray-50'}`}>
                {link.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-3 mt-3">
              {isLoggedIn ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">My Profile</Link>
                  <Link to="/orders" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">My Orders</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mt-1">Logout</button>
                </>
              ) : (
                <div className="flex gap-3 px-3">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-bold border-2 border-black text-black rounded-xl hover:bg-black hover:text-white transition-colors">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 text-sm font-bold bg-black text-white rounded-xl hover:bg-gray-800 transition-colors">Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  )
}
