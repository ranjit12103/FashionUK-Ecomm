import { useState } from 'react'
import { Link } from 'react-router-dom'

const footerLinks = {
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Sustainability', href: '#' },
  ],
  Help: [
    { label: 'FAQ', href: '#' },
    { label: 'Shipping Info', href: '#' },
    { label: 'Returns', href: '#' },
    { label: 'Size Guide', href: '#' },
    { label: 'Contact Us', href: '#' },
  ],
  Shop: [
    { label: 'New In', href: '/shop?filter=new' },
    { label: 'Best Sellers', href: '/shop?filter=bestseller' },
    { label: 'Sale', href: '/shop?filter=sale' },
    { label: 'All Products', href: '/shop' },
  ],
}

const categories = ['Shirts', 'T-Shirts', 'Trousers', 'Jackets', 'Hoodies', 'Jeans']

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">

          {/* Brand + newsletter */}
          <div className="lg:col-span-2">
            <Link to="/" className="text-2xl font-black uppercase tracking-tighter text-white">FashionUK</Link>
            <p className="text-gray-400 text-sm mt-4 mb-6 leading-relaxed max-w-xs">
              Premium British menswear for the modern man. Quality fits, affordable prices.
            </p>
            {subscribed ? (
              <div className="border border-white/20 px-5 py-3 inline-block rounded-xl">
                <p className="text-sm font-semibold">✓ Subscribed! Check your inbox.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true) }} className="flex max-w-sm">
                <input type="email" placeholder="Your email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/30 px-4 py-3 text-sm outline-none focus:border-white/50 rounded-l-xl" />
                <button type="submit"
                  className="bg-white text-black px-5 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors rounded-r-xl whitespace-nowrap">
                  Join
                </button>
              </form>
            )}
            <div className="flex gap-3 mt-6">
              {['IG', 'FB', 'TW', 'YT'].map((s) => (
                <a key={s} href="#"
                  className="w-9 h-9 border border-white/20 rounded-xl flex items-center justify-center text-xs font-bold text-gray-400 hover:bg-white hover:text-black transition-all">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-5">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-4">Shop Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link key={cat} to={`/shop?category=${cat.toLowerCase()}`}
                className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-full transition-all">
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 flex flex-col lg:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} FashionUK. All rights reserved.</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {['Visa', 'Mastercard', 'PayPal', 'Razorpay', 'UPI'].map((m) => (
              <span key={m} className="border border-white/15 px-3 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider rounded-md">{m}</span>
            ))}
          </div>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Cookies'].map((l) => (
              <a key={l} href="#" className="text-xs text-gray-500 hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
