import { Link } from 'react-router-dom'
import { removeFromWishlistApi } from '../api/wishlistApi'
import { useCart } from '../context/CartContext'

export default function WishlistItem({ item, onRemove }) {
  const { addToCart } = useCart()
  const { product } = item

  const handleMoveToCart = async () => {
    try {
      await addToCart(product.id, null, 1)
      await removeFromWishlistApi(product.id)
      onRemove(product.id)
    } catch {}
  }

  const handleRemove = async () => {
    try {
      await removeFromWishlistApi(product.id)
      onRemove(product.id)
    } catch {}
  }

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
      <Link to={`/product/${product.slug}`} className="w-24 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {product.primary_image ? (
          <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-12 bg-gray-300 rounded-t-full" />
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/product/${product.slug}`}
          className="text-sm font-bold uppercase tracking-wide text-black hover:underline block truncate">
          {product.name}
        </Link>

        <div className="flex items-center gap-2 mt-2">
          <span className={`text-sm font-bold ${product.is_on_sale ? 'text-red-600' : 'text-black'}`}>
            ₹{parseFloat(product.price).toFixed(2)}
          </span>
          {product.is_on_sale && (
            <span className="text-xs text-gray-400 line-through">₹{parseFloat(product.original_price).toFixed(2)}</span>
          )}
        </div>

        <p className={`text-xs mt-1 font-semibold ${product.is_in_stock ? 'text-green-600' : 'text-red-500'}`}>
          {product.is_in_stock ? 'In Stock' : 'Out of Stock'}
        </p>

        <div className="flex items-center gap-3 mt-3">
          <button onClick={handleMoveToCart} disabled={!product.is_in_stock}
            className="px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-lg">
            Move to Cart
          </button>
          <button onClick={handleRemove}
            className="text-xs text-gray-400 hover:text-red-600 transition-colors font-bold uppercase tracking-wide">
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
