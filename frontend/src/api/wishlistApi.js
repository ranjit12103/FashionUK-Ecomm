import api from './axiosInstance'

export const getWishlistApi = () => api.get('/wishlist/')
export const addToWishlistApi = (product_id) => api.post('/wishlist/add/', { product_id })
export const removeFromWishlistApi = (product_id) => api.delete(`/wishlist/${product_id}/remove/`)
export const checkWishlistApi = (product_id) => api.get(`/wishlist/check/${product_id}/`)
