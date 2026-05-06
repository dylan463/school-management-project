import api from './api'

const notificationsService = {
  getNotifications: async () => {
    const response = await api.get('/notifications/')
    return response.data
  },
  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread_count/')
    return response.data.count
  }
}

export default notificationsService