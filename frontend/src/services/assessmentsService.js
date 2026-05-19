import api from './api'

const assessmentsService = {
  assessmentService: {
    getAssessments: async (filters = {}) => {
      const params = new URLSearchParams(filters)
      const response = await api.get(`/assessments/assessments/?${params.toString()}`)
      return response.data
    },
    createAssessment: async (data) => {
      const response = await api.post('/assessments/assessments/', data)
      return response.data
    },
    updateAssessment: async (id, data) => {
      const response = await api.patch(`/assessments/assessments/${id}/`, data)
      return response.data
    },
    deleteAssessment: async (id) => {
      const response = await api.delete(`/assessments/assessments/${id}/`)
      return response.data
    },
    publishAssessment: async (id) => {
      const response = await api.post(`/assessments/assessments/${id}/publish/`)
      return response.data
    },
    unpublishAssessment: async (id) => {
      const response = await api.post(`/assessments/assessments/${id}/unpublish/`)
      return response.data
    },
    getAsessementAttendant: async (id, filters = {}) => {
      const params = new URLSearchParams(filters)
      const response = await api.get(`/assessments/assessments/${id}/attendant_student/?${params.toString()}`)
      return response.data
    }
  },
  gradeService: {
    getGrades: async (filters = {}) => {
      const params = new URLSearchParams(filters)
      const response = await api.get(`/assessments/grades/?${params.toString()}`)
      return response.data
    },
    createGrade: async (data) => {
      const response = await api.post('/assessments/grades/', data)
      return response.data
    },
    updateGrade: async (id, data) => {
      const response = await api.patch(`/assessments/grades/${id}/`, data)
      return response.data
    },
    deleteGrade: async (id) => {
      const response = await api.delete(`/assessments/grades/${id}/`)
      return response.data
    }
  },
  resultService: {
    getResults: async (filters = {}) => {
      const params = new URLSearchParams(filters)
      const response = await api.get(`/assessments/results/?${params.toString()}`)
      return response.data
    },
    publish: async (data) => {
      const response = await api.post(`/assessments/results/publish/`, data)
    }
  },
  bulletinService: {
    getBulletins: async (filters = {}) => {
      const params = new URLSearchParams(filters)
      const response = await api.get(`/assessments/bulletins/?${params.toString()}`)
      return response.data
    }
  }
}

export default assessmentsService