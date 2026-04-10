import request from '@/utils/request'

export const getByBarcode = (barcode) => request.get(`/products/barcode/${barcode}`)
export const getById = (id) => request.get(`/products/${id}`)
export const searchProducts = (params) => request.get('/products/search', { params })
export const getHotProducts = (limit = 10) => request.get('/products/hot', { params: { limit } })
export const getCategories = () => request.get('/categories')
