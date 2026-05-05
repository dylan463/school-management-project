import api from './api'

const notificationsService = {
  // Notifications
  getNotifications: (params = {}) => api.get('/notifications/', { params }).then(r => r.data),
  getNotification: (id) => api.get(`/notifications/${id}/`).then(r => r.data),
  createNotification: (data) => api.post('/notifications/', data).then(r => r.data),
  updateNotification: (id, data) => api.patch(`/notifications/${id}/`, data).then(r => r.data),
  deleteNotification: (id) => api.delete(`/notifications/${id}/`).then(r => r.data),
}

export default notificationsService