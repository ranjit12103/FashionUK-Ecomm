import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartItem({ item }) {
  const { updateItem, removeItem } = useCart()
  const { id, product, variant, quantity, unit_price, original_unit_price, unit_savings, line_total } = item

  return (
    <div className="flex gap-4 py-5 border-b border-gray-100 last:border-0">
      {/* Image */}
      <Link to={`/product/${product.slug}`}
        className="w-24 h-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {product.primary_image ? (
          <img src={item.product.primary_image} alt={item.product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-12 bg-gray-300 rounded-t-full" />
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link to={`/product/${product.slug}`}
          className="text-sm font-bold uppercase tracking-wide text-black hover:underline truncate block">
          {product.name}
        </Link>

        {/* Variant */}
        {variant && (
          <p className="text-xs text-gray-500 mt-0.5">
            {variant.colour?.name && `${variant.colour.name}`}
            {variant.size?.name && ` / ${variant.size.name}`}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-bold text-black">₹{parseFloat(unit_price).toFixed(2)}</span>
          {unit_savings > 0 && (
            <span className="text-xs text-gray-400 line-through">₹{parseFloat(original_unit_price).toFixed(2)}</span>
          )}
          {unit_savings > 0 && (
            <span className="text-xs font-bold text-red-600">Save ₹{parseFloat(unit_savings).toFixed(2)}</span>
          )}
        </div>

        {/* Quantity + Remove */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => quantity > 1 ? updateItem(id, quantity - 1) : removeItem(id)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold">
              −
            </button>
            <span className="w-10 text-center text-sm font-bold">{quantity}</span>
            <button onClick={() => updateItem(id, quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-bold">
              +
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-bold">₹{parseFloat(line_total).toFixed(2)}</span>
            <button onClick={() => removeItem(id)}
              className="text-xs text-gray-400 hover:text-red-600 transition-colors uppercase tracking-wide font-bold">
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
