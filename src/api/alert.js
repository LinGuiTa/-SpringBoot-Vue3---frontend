import request from '@/utils/request'

export const createAlert = (data) => request.post('/alerts', data)
export const deleteAlert = (alertId) => request.delete(`/alerts/${alertId}`)
export const getAlerts = () => request.get('/alerts')
export const updateAlert = (alertId, targetPrice) => request.put(`/alerts/${alertId}`, null, { params: { targetPrice } })
