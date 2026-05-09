import api from './api'

const assessmentsService = {
  assessmentService:{
    getAssessments: async (filters={}) => {
      const params = new URLSearchParams(filters)
      const response = await api.get(`/assessments/?${params.toString()}`)
      return response.data
    },
    createAssessment: async (name,type,session,location,grade_weight,date,course_module,school_year) => {
      const data = {
        name,type,session,location,grade_weight,date,course_module,school_year
      }
      const response = await api.post('/assessments/', data)
      return response.data
    },
    updateAssessment: async (id, data) => {
      const response = await api.patch(`/assessments/${id}/`, data)
      return response.data
    },
    deleteAssessment: async (id) => {
      const response = await api.delete(`/assessments/${id}/`)
      return response.data
    }
  },
  gradeService:{
    getGrades: async (filters={}) => {
      const params = new URLSearchParams(filters)
      const response = await api.get(`/assessments/grades/?${params.toString()}`)
      return response.data
    },
    createGrade: async (enrollment,assessment,score) => {
      const data = { enrollment,assessment,score }
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
  resultService:{
    getResults: async (filters={}) => {
      const params = new URLSearchParams(filters)
      const response = await api.get(`/assessments/results/?${params.toString()}`)
      return response.data
    }
  }
}

export default assessmentsService