import api from './api'

export const scheduleService= {
  list: async (filters={}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/timetable/schedules/?${params.toString()}`)
    return response.data
  },
  retrieve: async (id) => {
    const response = await api.get(`/timetable/schedules/${id}/`)
    return response.data
  },
  create: async (formation,semester) => {
    const data = { formation, semester }
    const response = await api.post('/timetable/schedules/', data)
    return response.data
  },
  update: async (id, data) => {
    const response = await api.patch(`/timetable/schedules/${id}/`, data)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/timetable/schedules/${id}/`)
    return response.data
  },
}

export const scheduleEntryService= {
  list: async (filters={}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/timetable/schedule-entries/?${params.toString()}`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/timetable/schedule-entries/', data)
    return response.data
  },
  update: async ({id, data}) => {
    const response = await api.patch(`/timetable/schedule-entries/${id}/`, data)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/timetable/schedule-entries/${id}/`)
    return response.data
  },
}


export const teacherAvalabilityService= {
  list: async (filters={}) => {
    const params = new URLSearchParams(filters)
    const response = await api.get(`/timetable/teacher-availabilities/?${params.toString()}`)
    return response.data
  },
  create: async (data) => {
    const response = await api.post('/timetable/teacher-availabilities/', data)
    return response.data
  },
  update: async ({id, data}) => {
    const response = await api.patch(`/timetable/teacher-availabilities/${id}/`, data)
    return response.data
  },
  delete: async (id) => {
    const response = await api.delete(`/timetable/teacher-availabilities/${id}/`)
    return response.data
  },
}

