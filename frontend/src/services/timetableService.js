import api from './api'

const timetableService = {
  scheduleService:{
    getSchedules: async (filters={}) => {
      const params = new URLSearchParams(filters)
      const response = await api.get(`/timetable/schedules/?${params.toString()}`)
      return response.data
    },
    createSchedule: async (formation,semester) => {
      const data = { formation, semester }
      const response = await api.post('/timetable/schedules/', data)
      return response.data
    },
    updateSchedule: async (id, data) => {
      const response = await api.patch(`/timetable/schedules/${id}/`, data)
      return response.data
    },
    deleteSchedule: async (id) => {
      const response = await api.delete(`/timetable/schedules/${id}/`)
      return response.data
    },
    publishSchedule: async (id) => {
      const response = await api.post(`/timetable/schedules/${id}/publish/`)
      return response.data
    },
    unpublishSchedule: async (id) => {
      const response = await api.post(`/timetable/schedules/${id}/unpublish/`)
      return response.data
    }
  },
  scheduleEntryService:{
    getScheduleEntries: async (filters={}) => {
      const params = new URLSearchParams(filters)
      const response = await api.get(`/timetable/schedule_entries/?${params.toString()}`)
      return response.data
    },
    createScheduleEntry: async (schedule, course_module, teacher, day, start_time, end_time, classroom) => {
      const data = { schedule, course_module, teacher, day, start_time, end_time, classroom }
      const response = await api.post('/timetable/schedule_entries/', data)
      return response.data
    },
    updateScheduleEntry: async (id, data) => {
      const response = await api.patch(`/timetable/schedule_entries/${id}/`, data)
      return response.data
    },
    deleteScheduleEntry: async (id) => {
      const response = await api.delete(`/timetable/schedule_entries/${id}/`)
      return response.data
    }
  }
}

export default timetableService