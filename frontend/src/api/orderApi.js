import api from './axiosInstance'

export const placeOrderApi = (data) => api.post('/orders/checkout/', data)
export const getOrdersApi = () => api.get('/orders/')
export const getOrderDetailApi = (orderNumber) => api.get(`/orders/${orderNumber}/`)
export const cancelOrderApi = (orderNumber) => api.post(`/orders/${orderNumber}/cancel/`)
export const getAddressesApi = () => api.get('/orders/addresses/')
export const addAddressApi = (data) => api.post('/orders/addresses/', data)