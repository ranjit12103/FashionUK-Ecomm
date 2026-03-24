import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { addToWishlistApi, removeFromWishlistApi } from '../api/wishlistApi'

export default function ProductCard({ product, wishlisted: initialWishlisted = false }) {
  const [hovered, setHovered] = useState(false)
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [adding, setAdding] = useState(false)
  const { addToCart } = useCart()
  const { isLoggedIn } = useAuth()

  const { id, name, slug, price, original_price, discount_percent, is_on_sale, primary_image, badge, bg_color } = product

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) return
    try {
      if (wishlisted) {
        await removeFromWishlistApi(id)
        setWishlisted(false)
      } else {
        await addToWishlistApi(id)
        setWishlisted(true)
      }
    } catch {}
  }

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) return
    try {
      setAdding(true)
      await addToCart(id, null, 1)
    } catch {}
    finally { setAdding(false) }
  }

  return (
    <Link to={`/product/${slug}`} className="group block no-underline"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>

      {/* Image Container */}
      <div className="relative overflow-hidden mb-3" style={{ aspectRatio: '3/4', background: bg_color || '#f5f5f5' }}>
        {primary_image ? (
          <img src={primary_image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-1/2 h-3/4 bg-black/10 rounded-t-full" />
          </div>
        )}

        {/* Badge */}
        {(badge || is_on_sale) && (
          <div className={`absolute top-2 left-2 text-white text-[9px] font-bold px-2 py-1 uppercase tracking-wider ${is_on_sale ? 'bg-red-600' : 'bg-black'}`}>
            {is_on_sale ? `−${discount_percent}%` : badge}
          </div>
        )}

        {/* Wishlist */}
        <button onClick={handleWishlist}
          className={`absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-sm shadow-sm transition-all duration-200 ${hovered || wishlisted ? 'opacity-100' : 'opacity-0'}`}>
          {wishlisted ? '❤️' : '♡'}
        </button>

        {/* Quick Add */}
        <div className={`absolute bottom-0 left-0 right-0 bg-black text-white text-[10px] font-bold uppercase tracking-widest py-2.5 text-center transition-transform duration-200 ${hovered ? 'translate-y-0' : 'translate-y-full'}`}>
          <button onClick={handleQuickAdd} className="w-full" disabled={adding}>
            {adding ? 'Adding...' : '+ Quick Add'}
          </button>
        </div>
      </div>

      {/* Info */}
      <p className="text-xs font-bold uppercase tracking-wide text-black mb-1 truncate">{name}</p>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${is_on_sale ? 'text-red-600' : 'text-black'}`}>
          ₹{parseFloat(price).toFixed(2)}
        </span>
        {is_on_sale && (
          <span className="text-xs text-gray-400 line-through">₹{parseFloat(original_price).toFixed(2)}</span>
        )}
      </div>
    </Link>
  )
}
