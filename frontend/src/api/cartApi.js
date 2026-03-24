import api from './axiosInstance'

export const getCartApi = () => api.get('/cart/')
export const addToCartApi = (data) => api.post('/cart/add/', data)
export const updateCartItemApi = (id, quantity) => api.patch(`/cart/items/${id}/`, { quantity })
export const removeCartItemApi = (id) => api.delete(`/cart/items/${id}/delete/`)
export const clearCartApi = () => api.delete('/cart/clear/')
