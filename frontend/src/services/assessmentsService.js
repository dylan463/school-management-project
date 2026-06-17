import api from './api'

export const enrollmentService = {
  list: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/assessments/enrollments/?${params.toString()}`)
    return response.data
  },
  retrieve: async (id) => {
    const response = await api.get(`/assessments/enrollments/${id}/`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/assessments/enrollments/', data)
    return response.data
  },
  update: async ({ id, data }) => {
    const response = await api.patch(`/assessments/enrollments/${id}/`, data)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/assessments/enrollments/${id}/`)
    return response.data
  },
  changeStatus: async ({ id, data }) => {
    const response = await api.post(`/assessments/enrollments/${id}/change_status/`, data)
    return response.data
  },
  bulletin: async (id) => {
    const response = await api.post(`/assessments/enrollments/${id}/bulletin/`)
    return response.data
  },
  autoDeliberate: async (filters = {}) => {
    const response = await api.post('/assessments/enrollments/deliberate/', filters)
    return response.data
  },
}

export const assessmentService = {
  list: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/assessments/assessments/?${params.toString()}`)
    return response.data
  },
  retrieve: async (id) => {
    const response = await api.get(`/assessments/assessments/${id}/`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/assessments/assessments/', data)
    return response.data
  },
  update: async ({ id, data }) => {
    const response = await api.patch(`/assessments/assessments/${id}/`, data)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/assessments/assessments/${id}/`)
    return response.data
  },
  togglePublication: async (id) => {
    const response = await api.post(`/assessments/assessments/${id}/toggle_publication/`)
    return response.data
  },
  attendants: async ({ id, ...filters }) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/assessments/assessments/${id}/attendant_student/?${params.toString()}`)
    return response.data
  }
}

export const gradeService = {
  list: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/assessments/grades/?${params.toString()}`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/assessments/grades/', data)
    return response.data
  },
  update: async ({ id, data }) => {
    const response = await api.patch(`/assessments/grades/${id}/`, data)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/assessments/grades/${id}/`)
    return response.data
  }
}

export const resultService = {
  list: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/assessments/results/?${params.toString()}`)
    return response.data
  },
}

export const debtService = {
  list: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/assessments/debts/?${params.toString()}`)
    return response.data
  },
}

export const gridService = {
  retrieve: async (data) => {
    const params = new URLSearchParams(data)
    const response = await api.get(`/assessments/grade-grid/?${params.toString()}`)
    return response.data
  }
}
