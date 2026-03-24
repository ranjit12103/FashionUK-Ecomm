import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import WishlistItem from '../components/WishlistItem'
import Loader from '../components/Loader'
import { getWishlistApi } from '../api/wishlistApi'

export default function WishlistPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWishlistApi()
      .then(({ data }) => setItems(data.results || data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = (productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }

  if (loading) return <Loader fullScreen />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-black">Wishlist</h1>
          <span className="text-sm text-gray-400 font-medium">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-6">♡</div>
            <h2 className="text-2xl font-black uppercase text-black mb-3">Your wishlist is empty</h2>
            <p className="text-gray-400 mb-8">Save items you love for later</p>
            <Link to="/shop" className="inline-block bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors no-underline rounded-xl">
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            {items.map((item) => <WishlistItem key={item.id} item={item} onRemove={handleRemove} />)}
          </div>
        )}
      </div>
    </div>
  )
}
