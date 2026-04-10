import request from '@/utils/request'

export const addFavorite = (productId) => request.post(`/favorites/${productId}`)
export const removeFavorite = (productId) => request.delete(`/favorites/${productId}`)
export const getFavorites = () => request.get('/favorites')
export const getFavoriteStatus = (productId) => request.get(`/favorites/${productId}/status`)
