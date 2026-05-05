import api from './api'

const assessmentsService = {
  // Assessments
  getAssessments: (params = {}) => api.get('/assessments/', { params }).then(r => r.data),
  getAssessment: (id) => api.get(`/assessments/${id}/`).then(r => r.data),
  createAssessment: (data) => api.post('/assessments/', data).then(r => r.data),
  updateAssessment: (id, data) => api.patch(`/assessments/${id}/`, data).then(r => r.data),
  deleteAssessment: (id) => api.delete(`/assessments/${id}/`).then(r => r.data),

  // Grades
  getGrades: (params = {}) => api.get('/assessments/grades/', { params }).then(r => r.data),
  getGrade: (id) => api.get(`/assessments/grades/${id}/`).then(r => r.data),
  createGrade: (data) => api.post('/assessments/grades/', data).then(r => r.data),
  updateGrade: (id, data) => api.patch(`/assessments/grades/${id}/`, data).then(r => r.data),
  deleteGrade: (id) => api.delete(`/assessments/grades/${id}/`).then(r => r.data),
}

export default assessmentsService