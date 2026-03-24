import { createContext, useContext, useState, useEffect } from 'react'
import { getCartApi, addToCartApi, updateCartItemApi, removeCartItemApi, clearCartApi } from '../api/cartApi'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchCart = async () => {
    if (!isLoggedIn) return
    try {
      setLoading(true)
      const { data } = await getCartApi()
      setCart(data)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchCart()
  }, [isLoggedIn])

const addToCart = async (product_id, variant_id = null, quantity = 1) => {
  await addToCartApi({ product_id, variant_id, quantity })
  await fetchCart()
}

  const updateItem = async (id, quantity) => {
    const { data } = await updateCartItemApi(id, quantity)
    setCart(data)
  }

  const removeItem = async (id) => {
    const { data } = await removeCartItemApi(id)
    setCart(data)
  }

  const clearCart = async () => {
    await clearCartApi()
    setCart(null)
  }

  const itemCount = cart?.total_items || 0

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, fetchCart, addToCart, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
