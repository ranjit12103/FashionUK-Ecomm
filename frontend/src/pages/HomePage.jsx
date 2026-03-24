import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import { getFeaturedApi, getNewInApi, getCategoriesApi } from '../api/productApi'
import hero from '../assets/images/hero.png'
import Jacket from '../assets/images/jackets.png'
import jeans1 from '../assets/images/jeans/jeans1.png'
import jeans2 from '../assets/images/jeans/jeans2.png'
import jeans3 from '../assets/images/jeans/jeans3.png'
import jeans4 from '../assets/images/jeans/jeans4.png'
import jeans5 from '../assets/images/jeans/jeans5.png'


const fits = [
  { name: 'Wide Fit', shade: '#bfdbfe', image: jeans1 },
  { name: 'Straight Fit', shade: '#93c5fd', image: jeans2 },
  { name: 'Tapered Fit', shade: '#60a5fa', image: jeans3 },
  { name: 'Slim Fit', shade: '#3b82f6', image: jeans4 },
  { name: 'Skinny Fit', shade: '#1d4ed8', image: jeans5 },
]

export default function HomePage() {
  const [featured, setFeatured] = useState([])
  const [newIn, setNewIn] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFit, setActiveFit] = useState(2)

  useEffect(() => {
    Promise.all([getFeaturedApi(), getNewInApi(), getCategoriesApi()])
      .then(([f, n, c]) => {
        setFeatured(f.data.results || f.data)
        setNewIn(n.data.results || n.data)
        setCategories(c.data.results || c.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* ── Hero ───────────────────────────────── */}
      <section style={{ backgroundImage: `url(${hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: 560 }}
        className="relative overflow-hidden flex items-end">
        <div className="absolute top-10 right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative z-10 p-16 md:p-20 max-w-2xl">
          <span className="inline-block text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-300 border border-cyan-400/40 px-3 py-1 mb-5 rounded-sm">SS25 Collection</span>
          <h1 className="text-white font-black uppercase tracking-tight leading-[0.9] mb-6" style={{ fontSize: 'clamp(56px, 9vw, 100px)' }}>
            A New<br />
            <span style={{ WebkitTextStroke: '2px white', color: 'transparent' }}>Season</span>
          </h1>
          <p className="text-white/65 text-base leading-relaxed mb-8 max-w-sm">
            Discover the latest arrivals — elevated essentials and bold statement pieces for the season ahead.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link to="/shop?filter=new"
              className="inline-flex items-center gap-2 bg-white text-black px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] no-underline hover:bg-black hover:text-white transition-colors">
              Shop New In →
            </Link>
            <Link to="/shop"
              className="inline-flex items-center border border-white/40 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] no-underline hover:bg-white/10 transition-colors">
              View Lookbook
            </Link>
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider">
          Get 10% Off →
        </div>
      </section>

      {/* ── Category Banner ──────────────────────── */}
      <section style={{ backgroundImage: `url(${Jacket})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: 560 }}
        className="relative overflow-hidden flex items-end">
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />
        <div className="relative z-10 p-12 md:p-16">
          <p className="text-white/55 text-[10px] uppercase tracking-[0.3em] mb-2 font-bold">New Arrivals</p>
          <h2 className="text-white font-black uppercase tracking-tight leading-[0.9] mb-6" style={{ fontSize: 'clamp(56px, 8vw, 96px)' }}>Jackets</h2>
          <Link to="/shop?category=jackets"
            className="inline-flex items-center gap-3 text-white text-xs font-bold uppercase tracking-[0.2em] no-underline border-b border-white pb-0.5">
            See All →
          </Link>
        </div>
        <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider">Get 10% Off →</div>
      </section>

      {/* ── Category Grid ───────────────────────── */}
      {categories.length > 0 && (
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {categories.slice(0, 4).map((cat) => (
              <Link key={cat.id} to={`/shop?category=${cat.slug}`}
                className="relative group flex flex-col justify-end p-5 overflow-hidden no-underline"
                style={{ background: cat.bg_color || '#f5f5f5', aspectRatio: '3/4' }}>
                {cat.image && <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="relative z-10">
                  <p className="text-white/70 text-[9px] uppercase tracking-[0.2em] mb-1 font-bold">Shop</p>
                  <p className="text-white text-lg font-black uppercase tracking-tight">{cat.name}</p>
                  <div className="h-0.5 w-0 bg-white group-hover:w-full transition-all duration-300 mt-2" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Denim Edit ──────────────────────────── */}
      <section className="bg-[#f5f4f2] overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
          <div className="flex flex-col justify-center px-12 md:px-20 py-16 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-4 font-bold">New Collection</p>
              <h2 className="font-black uppercase tracking-tight leading-[0.85] text-black mb-6" style={{ fontSize: 'clamp(52px, 7vw, 88px)' }}>
                THE<br />DENIM<br />
                <span style={{ WebkitTextStroke: '2px #111', color: 'transparent' }}>EDIT</span>
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-8">
                Five iconic fits. Endless combinations. Explore our curated denim collection for every style.
              </p>
              <Link to="/shop?category=jeans"
                className="inline-flex items-center gap-3 bg-black text-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] no-underline hover:bg-gray-800 transition-colors">
                Shop Denim →
              </Link>
            </div>
          </div>
          <div className="bg-[#d6d3d1] relative flex items-center justify-center min-h-[400px]">
            <div className="w-44 h-3/4 bg-black/15 rounded-t-full" />
            <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1.5">Get 10% Off →</div>
            <div className="absolute bottom-6 left-6">
              {['Wide Fit', 'Straight Fit', 'Tapered', 'Slim Fit', 'Skinny'].map((f) => (
                <p key={f} className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">— {f}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Jeans Fit Guide ─────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2 font-bold">Discover</p>
              <h2 className="text-4xl font-black uppercase tracking-tight text-black">Find Your Fit</h2>
            </div>
            <Link to="/shop?category=jeans" className="text-xs font-bold uppercase tracking-widest text-black border-b-2 border-black pb-0.5 no-underline">Jeans →</Link>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {fits.map((fit, idx) => (
              <button
                key={fit.name}
                onClick={() => setActiveFit(idx)}
                className="relative overflow-hidden flex flex-col items-center outline-none transition-all rounded-md"
                style={{
                  aspectRatio: '2/3',
                  border: idx === activeFit ? '2.5px solid #111' : '2.5px solid transparent',
                  backgroundColor: fit.shade,
                }}
              >
                {/* background image */}
                <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${fit.image})` }} />
                {/* dark overlay for contrast */}
                <div className="absolute inset-0 bg-black/10" />
                {/* <div className="absolute top-[12%] left-1/2 -translate-x-1/2 bg-white/35 h-[72%]"
                  style={{ width: idx <= 1 ? '70%' : idx === 2 ? '60%' : idx === 3 ? '52%' : '44%', clipPath: 'polygon(25% 0%, 75% 0%, 65% 100%, 35% 100%)' }} /> */}
                <div className="absolute bottom-0 inset-x-0 bg-white/90 py-2 text-center">
                  <p className="text-[10px] font-black uppercase tracking-tight text-black">{fit.name}</p>
                </div>
                {idx === activeFit && <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full" />}
              </button>
            ))}
          </div>
          <div className="text-center mt-5">
            <Link to={`/shop?fit=${fits[activeFit].name.toLowerCase().replace(' ', '-')}`}
              className="text-xs font-bold uppercase tracking-widest text-black underline underline-offset-4 no-underline hover:no-underline">
              Shop {fits[activeFit].name} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Products ───────────────────── */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight text-black">We Think You'll Like</h2>
            <Link to="/shop" className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 no-underline">View All →</Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-20"><Loader size="lg" /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {(featured.length ? featured : newIn).slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── New In ──────────────────────────────── */}
      {newIn.length > 0 && (
        <section className="bg-white py-14">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tight text-black">New In</h2>
              <Link to="/shop?filter=new" className="text-xs font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 no-underline">See All →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {newIn.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter ──────────────────────────── */}
      <section className="bg-black text-white py-20 text-center relative overflow-hidden">
        <div className="max-w-xl mx-auto px-6 relative z-10">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 mb-4 font-bold">FashionUK</p>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-1 leading-none">Join Today and Get</h2>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-6"
            style={{ WebkitTextStroke: '1.5px white', color: 'transparent' }}>10% Off</h2>
          <p className="text-white/45 text-sm leading-relaxed mb-8">Subscribe for exclusive deals, style tips, and early access to new arrivals.</p>
          <div className="flex max-w-sm mx-auto">
            <input type="email" placeholder="Your email address"
              className="flex-1 bg-transparent border border-white/25 text-white placeholder-white/30 px-4 py-3.5 text-sm outline-none focus:border-white/50" />
            <button className="bg-white text-black px-6 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors whitespace-nowrap">
              Join Now →
            </button>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ───────────────────────────── */}
      <section className="bg-white border-t border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '↩', label: 'Free Returns', sub: 'On Orders Above ₹999' },
            { icon: '🚚', label: 'Free Delivery', sub: 'On Orders Above ₹999' },
            { icon: '⭐', label: 'Exclusive', sub: 'Member Benefits' },
            { icon: '💳', label: 'Easy Payment', sub: 'Razorpay / UPI' },
          ].map((usp) => (
            <div key={usp.label} className="flex flex-col items-center text-center px-4">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-lg mb-3">{usp.icon}</div>
              <p className="text-xs font-bold uppercase tracking-wider text-black mb-1">{usp.label}</p>
              <p className="text-xs text-gray-400">{usp.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
