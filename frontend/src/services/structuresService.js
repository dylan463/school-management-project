import api from './api'

export const mentionService = {
  list: async (filters= {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/structures/mentions/?${params.toString()}`)
    return response.data
  },
  retrieve: async (id) => {
    const response = await api.get(`/structures/mentions/${id}/`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/structures/mentions/', data)
    return response.data
  },
  update: async ({id, data}) => {
    const response = await api.patch(`/structures/mentions/${id}/`, data)
    return response.data    
  },
  delete: async (id) => {
    const response = await api.delete(`/structures/mentions/${id}/`)
    return response.data
  }
}

export const formationService = {
  list: async (filters= {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/structures/formations/?${params.toString()}`)
    return response.data
  },
  retrieve: async (id) => {
    const response = await api.get(`/structures/formations/${id}/`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/structures/formations/', data)
    return response.data
  },
  update: async ({id, data}) => {
    const response = await api.patch(`/structures/formations/${id}/`, data)
    return response.data    
  },
  toggleActivation: async (id) => {
    const response = await api.post(`/structures/formations/${id}/toggle_activation/`)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/structures/formations/${id}/`)
    return response.data
  }
}

export const semesterService = {
  list: async (filters= {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/structures/semesters/?${params.toString()}`)
    return response.data
  },
  retrieve: async (id) => {
    const response = await api.get(`/structures/semesters/${id}/`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/structures/semesters/', data)
    return response.data
  },
  update: async ({id, data}) => {
    const response = await api.patch(`/structures/semesters/${id}/`, data)
    return response.data    
  },
  toggleActivation: async (id) => {
    const response = await api.post(`/structures/semesters/${id}/toggle_activation/`)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/structures/semesters/${id}/`)
    return response.data
  }
}

export const schoolyearService = {
  list: async (filters= {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/structures/schoolyears/?${params.toString()}`)
    return response.data
  },
  retrieve: async (id) => {
    const response = await api.get(`/structures/schoolyears/${id}/`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/structures/schoolyears/', data)
    return response.data
  },
  update: async ({id, data}) => {
    const response = await api.patch(`/structures/schoolyears/${id}/`, data)
    return response.data    
  },
  toggleLock: async (id) => {
    const response = await api.post(`/structures/schoolyears/${id}/toggle_lock/`)
    return response.data
  },
  changeStatus: async ({id, status}) => {
    const response = await api.post(`/structures/schoolyears/${id}/change_status/`, { status })
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/structures/schoolyears/${id}/`)
    return response.data
  }
}


export const coursemoduleService = {
  list: async (filters= {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/structures/coursemodules/?${params.toString()}`)
    return response.data
  },
  retrieve: async (id) => {
    const response = await api.get(`/structures/coursemodules/${id}/`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/structures/coursemodules/', data)
    return response.data
  },
  update: async ({id, data}) => {
    const response = await api.patch(`/structures/coursemodules/${id}/`, data)
    return response.data    
  },
  toggleActivation: async (id) => {
    const response = await api.post(`/structures/coursemodules/${id}/toggle_activation/`)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/structures/coursemodules/${id}/`)
    return response.data
  }
}

export const courseunitService = {
  list: async (filters= {}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/structures/courseunits/?${params.toString()}`)
    return response.data
  },
  retrieve: async (id) => {
    const response = await api.get(`/structures/courseunits/${id}/`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/structures/courseunits/', data)
    return response.data
  },
  update: async ({id, data}) => {
    const response = await api.patch(`/structures/courseunits/${id}/`, data)
    return response.data    
  },
  toggleActivation: async (id) => {
    const response = await api.post(`/structures/courseunits/${id}/toggle_activation/`)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/structures/courseunits/${id}/`)
    return response.data
  }
}