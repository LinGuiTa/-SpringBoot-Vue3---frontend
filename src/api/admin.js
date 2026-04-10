import request from '@/utils/request'

export const getDashboard = () => request.get('/admin/dashboard')
export const getUsers = (params) => request.get('/admin/users', { params })
export const updateUserStatus = (id, status) => request.put(`/admin/users/${id}/status`, null, { params: { status } })
export const updateUserRole = (id, role) => request.put(`/admin/users/${id}/role`, null, { params: { role } })
export const getAdminProducts = (params) => request.get('/admin/products', { params })
export const createProduct = (data) => request.post('/admin/products', data)
export const updateProduct = (id, data) => request.put(`/admin/products/${id}`, data)
export const deleteProduct = (id) => request.delete(`/admin/products/${id}`)
export const batchRefreshPrices = () => request.post('/admin/prices/batch-refresh')
export const getPriceMonitor = () => request.get('/admin/prices/monitor')
export const getConfigs = () => request.get('/admin/config')
export const updateConfig = (key, value) => request.put(`/admin/config/${key}`, null, { params: { value } })
