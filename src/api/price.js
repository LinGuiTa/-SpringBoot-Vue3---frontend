import request from '@/utils/request'

export const comparePrices = (productId) => request.get(`/prices/compare/${productId}`)
export const getLowestPrice = (productId) => request.get(`/prices/lowest/${productId}`)
export const getPlatforms = () => request.get('/prices/platforms')
export const refreshPrices = (productId) => request.post(`/prices/refresh/${productId}`)
export const getPriceHistory = (productId, params) => request.get(`/prices/history/${productId}`, { params })
export const getPriceStatistics = (productId, params) => request.get(`/prices/history/${productId}/statistics`, { params })
export const getPriceTrend = (productId) => request.get(`/prices/history/${productId}/trend`)
export const getBestBuyTime = (productId) => request.get(`/prices/history/${productId}/best-time`)
