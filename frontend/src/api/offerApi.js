import api from './axiosInstance'

export const validateCouponApi = (code, subtotal) =>
  api.post('/offers/coupons/validate/', { code, subtotal })
