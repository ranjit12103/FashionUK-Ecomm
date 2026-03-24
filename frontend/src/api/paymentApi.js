import api from './axiosInstance'

export const createRazorpayOrderApi = (order_number) =>
  api.post('/payments/create-order/', { order_number })

export const verifyPaymentApi = (data) =>
  api.post('/payments/verify/', data)
