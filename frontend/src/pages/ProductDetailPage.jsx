import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductDetailApi } from '../api/productApi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { addToWishlistApi, removeFromWishlistApi, checkWishlistApi } from '../api/wishlistApi'
import Loader from '../components/Loader'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedColour, setSelectedColour] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [wishlisted, setWishlisted] = useState(false)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('description')

  const { addToCart } = useCart()
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    setLoading(true)
    getProductDetailApi(slug)
      .then(({ data }) => {
        setProduct(data)
        if (isLoggedIn) {
          checkWishlistApi(data.id)
            .then(({ data: w }) => setWishlisted(w.in_wishlist))
            .catch(() => {})
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  // Get unique colours and sizes from variants
  const colours = product ? [...new Map(product.variants?.filter(v => v.colour).map(v => [v.colour.id, v.colour])).values()] : []
  const sizes = product ? [...new Map(product.variants?.filter(v => v.size).map(v => [v.size.id, v.size])).values()] : []

  useEffect(() => {
    if (product?.variants?.length && selectedColour && selectedSize) {
      const match = product.variants.find(v => v.colour?.id === selectedColour && v.size?.id === selectedSize)
      setSelectedVariant(match || null)
    }
  }, [selectedColour, selectedSize, product])

  const handleAddToCart = async () => {
    if (!isLoggedIn) return
    setError('')
    const variantRequired = product.variants?.length > 0
    if (variantRequired && !selectedVariant) {
      setError('Please select a colour and size.')
      return
    }
    setAdding(true)
    try {
      await addToCart(product.id, selectedVariant?.id || null, 1)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add to cart.')
    } finally { setAdding(false) }
  }

  const handleWishlist = async () => {
    if (!isLoggedIn) return
    try {
      if (wishlisted) { await removeFromWishlistApi(product.id); setWishlisted(false) }
      else { await addToWishlistApi(product.id); setWishlisted(true) }
    } catch {}
  }

  if (loading) return <Loader fullScreen />

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-black uppercase text-black mb-4">Product Not Found</h2>
        <Link to="/shop" className="text-sm font-bold text-black underline">← Back to Shop</Link>
      </div>
    </div>
  )

  const images = product.images?.length ? product.images : []
  const displayImage = images[selectedImage]?.image || product.primary_image

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-black transition-colors no-underline">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-black transition-colors no-underline">Shop</Link>
          {product.category && <><span>/</span><Link to={`/shop?category=${product.category.slug}`} className="hover:text-black transition-colors no-underline">{product.category.name}</Link></>}
          <span>/</span>
          <span className="text-black font-medium truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* ── Images ── */}
          <div className="flex gap-3">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex flex-col gap-2 w-20">
                {images.map((img, idx) => (
                  <button key={img.id} onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-24 overflow-hidden rounded-lg border-2 transition-all ${idx === selectedImage ? 'border-black' : 'border-transparent'}`}>
                    <img src={img.image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 relative overflow-hidden" style={{ aspectRatio: '3/4', background: product.bg_color || '#f5f5f5' }}>
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center rounded-xl">
                  <div className="w-1/3 h-3/4 bg-black/10 rounded-t-full" />
                </div>
              )}
              {product.is_on_sale && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 uppercase">
                  −{product.discount_percent}%
                </div>
              )}
            </div>
          </div>

          {/* ── Details ── */}
          <div className="lg:py-4">
            {product.badge && <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2.5 py-1 mb-3">{product.badge}</span>}
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-2">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className={`text-2xl font-black ${product.is_on_sale ? 'text-red-600' : 'text-black'}`}>
                ₹{parseFloat(product.price).toFixed(2)}
              </span>
              {product.is_on_sale && (
                <>
                  <span className="text-base text-gray-400 line-through">₹{parseFloat(product.original_price).toFixed(2)}</span>
                  <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Save ₹{parseFloat(product.discount_value).toFixed(2)}</span>
                </>
              )}
            </div>

            {/* Rating */}
            {product.review_count > 0 && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className={`text-sm ${s <= Math.round(product.average_rating) ? 'text-black' : 'text-gray-300'}`}>★</span>
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-medium">({product.review_count} reviews)</span>
              </div>
            )}

            {/* Colours */}
            {colours.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-3">
                  Colour{selectedColour && colours.find(c => c.id === selectedColour) ? `: ${colours.find(c => c.id === selectedColour).name}` : ''}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {colours.map((colour) => (
                    <button key={colour.id} onClick={() => setSelectedColour(colour.id)}
                      title={colour.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColour === colour.id ? 'border-black scale-110' : 'border-gray-300 hover:border-gray-500'}`}
                      style={{ background: colour.hex_code || '#ccc' }} />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-3">Select Size</p>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((size) => {
                    const variant = product.variants?.find(v => v.size?.id === size.id && (selectedColour ? v.colour?.id === selectedColour : true))
                    const inStock = variant ? variant.is_in_stock : true
                    return (
                      <button key={size.id} onClick={() => setSelectedSize(size.id)} disabled={!inStock}
                        className={`px-4 py-2 text-sm font-bold border-2 transition-all rounded-lg ${selectedSize === size.id ? 'border-black bg-black text-white' : inStock ? 'border-gray-200 text-gray-800 hover:border-black' : 'border-gray-100 text-gray-300 cursor-not-allowed line-through'}`}>
                        {size.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Error */}
            {error && <p className="text-red-600 text-sm font-medium mb-4">{error}</p>}

            {/* Add to cart */}
            <div className="flex gap-3 mb-6">
              {isLoggedIn ? (
                <button onClick={handleAddToCart} disabled={adding || !product.is_in_stock}
                  className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all ${added ? 'bg-green-600 text-white' : product.is_in_stock ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  {added ? '✓ Added to Bag' : adding ? 'Adding...' : product.is_in_stock ? 'Add to Bag' : 'Out of Stock'}
                </button>
              ) : (
                <Link to="/login" className="flex-1 py-4 text-sm font-bold uppercase tracking-widest bg-black text-white text-center no-underline hover:bg-gray-800 transition-colors">
                  Login to Buy
                </Link>
              )}
              <button onClick={handleWishlist}
                className="w-14 h-14 border-2 border-gray-200 hover:border-black transition-all flex items-center justify-center text-lg rounded-lg">
                {wishlisted ? '❤️' : '♡'}
              </button>
            </div>

            {/* Features */}
            <div className="space-y-3 py-5 border-t border-gray-100">
              {[
                { icon: '🚚', text: 'Free delivery on orders over ₹999' },
                { icon: '↩', text: 'Extended return period for 30 days' },
                { icon: '💳', text: 'Pay via Razorpay / UPI' },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3">
                  <span className="text-base">{f.icon}</span>
                  <span className="text-xs text-gray-600">{f.text}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-100 mt-5">
              <div className="flex gap-0">
                {['description', 'details', 'reviews'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              <div className="py-5">
                {activeTab === 'description' && (
                  <p className="text-sm text-gray-600 leading-relaxed">{product.description || product.short_description || 'No description available.'}</p>
                )}
                {activeTab === 'details' && (
                  <div className="space-y-2 text-sm">
                    {product.material && <div className="flex gap-4"><span className="w-32 text-gray-400 font-medium">Material</span><span className="text-gray-800">{product.material}</span></div>}
                    {product.fit && <div className="flex gap-4"><span className="w-32 text-gray-400 font-medium">Fit</span><span className="text-gray-800 capitalize">{product.fit}</span></div>}
                    {product.care_instructions && <div className="flex gap-4"><span className="w-32 text-gray-400 font-medium">Care</span><span className="text-gray-800">{product.care_instructions}</span></div>}
                    {product.country_of_origin && <div className="flex gap-4"><span className="w-32 text-gray-400 font-medium">Made In</span><span className="text-gray-800">{product.country_of_origin}</span></div>}
                    <div className="flex gap-4"><span className="w-32 text-gray-400 font-medium">SKU</span><span className="text-gray-800">{product.sku}</span></div>
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <div>
                    {product.reviews?.length > 0 ? product.reviews.map((review) => (
                      <div key={review.id} className="py-4 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">{[1,2,3,4,5].map((s) => <span key={s} className={`text-xs ${s <= review.rating ? 'text-black' : 'text-gray-200'}`}>★</span>)}</div>
                          <span className="text-xs font-bold text-black">{review.user_name}</span>
                          {review.is_verified_purchase && <span className="text-[10px] text-green-600 font-bold">✓ Verified</span>}
                        </div>
                        {review.title && <p className="text-sm font-bold text-black mb-1">{review.title}</p>}
                        <p className="text-sm text-gray-600">{review.comment}</p>
                      </div>
                    )) : <p className="text-sm text-gray-400">No reviews yet. Be the first to review this product!</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
