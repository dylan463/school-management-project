import api from './api'

const announcementsService = {
  // Announcements
  getAnnouncements: (params = {}) => api.get('/announcements/annoncements/', { params }).then(r => r.data),
  getAnnouncement: (id) => api.get(`/announcements/annoncements/${id}/`).then(r => r.data),
  createAnnouncement: (data) => api.post('/announcements/annoncements/', data).then(r => r.data),
  updateAnnouncement: (id, data) => api.patch(`/announcements/annoncements/${id}/`, data).then(r => r.data),
  deleteAnnouncement: (id) => api.delete(`/announcements/annoncements/${id}/`).then(r => r.data),
}

export default announcementsService