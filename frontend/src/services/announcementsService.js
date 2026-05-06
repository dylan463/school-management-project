import api from './api'

const announcementsService = {
  getAnnouncements: async () => {
    const response = await api.get('/announcements/')
    return response.data
  },
  createAnnouncement: async (title, content, audiences) => {
    const data = { title, content, audiences }
    const response = await api.post('/announcements/', data)
    return response.data
  },
  updateAnnouncement: async (id, data) => {
    const response = await api.patch(`/announcements/${id}/`, data)
    return response.data
  },
  deleteAnnouncement: async (id) => {
    const response = await api.delete(`/announcements/${id}/`)
    return response.data
  },
  getUnreadAnnouncementsCount:async ()=>{
    const response = await api.get('/announcements/unread_count/')
    return response.data
  },
  retrieve: async (id) => {
    const response = await api.get(`/announcements/${id}/`)
    return response.data
  }
}

export default announcementsService