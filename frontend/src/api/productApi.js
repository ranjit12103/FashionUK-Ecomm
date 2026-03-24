import api from './axiosInstance'

export const getProductsApi = (params) => api.get('/products/', { params })
export const getProductDetailApi = (slug) => api.get(`/products/${slug}/`)
export const getCategoriesApi = () => api.get('/products/categories/')
export const getFeaturedApi = () => api.get('/products/featured/')
export const getNewInApi = () => api.get('/products/new-in/')
export const getSaleApi = () => api.get('/products/sale/')
export const getBestsellersApi = () => api.get('/products/bestsellers/')
export const searchProductsApi = (q) => api.get('/products/search/', { params: { q } })
