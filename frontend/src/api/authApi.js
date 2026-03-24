import api from './axiosInstance'

export const loginApi = (data) => api.post('/users/login/', data)
export const registerApi = (data) => api.post('/users/register/', data)
export const getProfileApi = () => api.get('/users/profile/')
export const updateProfileApi = (data) => api.patch('/users/profile/', data)
export const changePasswordApi = (data) => api.post('/users/change-password/', data)
export const logoutApi = (refresh) => api.post('/users/logout/', { refresh })
