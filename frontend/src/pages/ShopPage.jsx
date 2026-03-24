import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import { getProductsApi, getCategoriesApi } from '../api/productApi'

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)

  const filter = searchParams.get('filter') || ''
  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''

  useEffect(() => {
    getCategoriesApi().then(({ data }) => setCategories(data.results || data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page }
    if (category) params.category = category
    if (search) params.search = search
    if (filter === 'new') params.is_new = 'true'
    if (filter === 'sale') params.is_on_sale = 'true'
    if (filter === 'bestseller') params.is_bestseller = 'true'
    if (filter === 'featured') params.is_featured = 'true'

    getProductsApi(params)
      .then(({ data }) => {
        setProducts(data.results || data)
        setTotalCount(data.count || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter, category, search, page])

  const filterTabs = [
    { label: 'All', value: '' },
    { label: 'New In', value: 'new' },
    { label: 'Sale', value: 'sale' },
    { label: 'Best Sellers', value: 'bestseller' },
    { label: 'Featured', value: 'featured' },
  ]

  const pageTitle = search ? `Search: "${search}"`
    : category ? categories.find((c) => c.slug === category)?.name || category
    : filterTabs.find((t) => t.value === filter)?.label || 'All Products'

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">FashionUK</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">{pageTitle}</h1>
          {totalCount > 0 && <p className="text-gray-400 text-sm mt-2">{totalCount} products</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-8 pb-6 border-b border-gray-100">
          {filterTabs.map((tab) => (
            <button key={tab.value}
              onClick={() => { setSearchParams(tab.value ? { filter: tab.value } : {}); setPage(1) }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all ${filter === tab.value ? 'bg-black text-white' : 'border border-gray-200 text-gray-600 hover:border-black hover:text-black'}`}>
              {tab.label}
            </button>
          ))}

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button key={cat.id}
                  onClick={() => { setSearchParams({ category: cat.slug }); setPage(1) }}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full transition-all ${category === cat.slug ? 'bg-black text-white' : 'border border-gray-200 text-gray-600 hover:border-black hover:text-black'}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-24"><Loader size="lg" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🔍</p>
            <h3 className="text-xl font-black uppercase text-black mb-2">No products found</h3>
            <p className="text-gray-400 text-sm">Try a different filter or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalCount > 20 && (
          <div className="flex justify-center gap-2 mt-12">
            {page > 1 && (
              <button onClick={() => setPage(page - 1)}
                className="px-5 py-2.5 border-2 border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors rounded-lg">
                ← Prev
              </button>
            )}
            {totalCount > page * 20 && (
              <button onClick={() => setPage(page + 1)}
                className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors rounded-lg">
                Next →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
