import api from './api'

const notificationsService = {
  list: async () => {
    const response = await api.get('/notifications/')
    return response.data
  },
  unreadCount: async () => {
    const response = await api.get('/notifications/unread_count/')
    return response.data.count
  }
}

export default notificationsService