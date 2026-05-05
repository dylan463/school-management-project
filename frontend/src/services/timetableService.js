import api from './api'

const timetableService = {
  // Admin Schedules
  getSchedules: (params = {}) => api.get('/timetable/admin/schedules/', { params }).then(r => r.data),
  getSchedule: (id) => api.get(`/timetable/admin/schedules/${id}/`).then(r => r.data),
  createSchedule: (data) => api.post('/timetable/admin/schedules/', data).then(r => r.data),
  updateSchedule: (id, data) => api.patch(`/timetable/admin/schedules/${id}/`, data).then(r => r.data),
  deleteSchedule: (id) => api.delete(`/timetable/admin/schedules/${id}/`).then(r => r.data),
  addScheduleEntry: (scheduleId, data) => api.post(`/timetable/admin/schedules/${scheduleId}/add_entry/`, data).then(r => r.data),
  updateScheduleEntry: (scheduleId, entryId, data) => api.patch(`/timetable/admin/schedules/${scheduleId}/update_entry/${entryId}/`, data).then(r => r.data),

  // Student Schedules
  getStudentSchedules: (params = {}) => api.get('/timetable/student/schedules/', { params }).then(r => r.data),
  getMyStudentSchedule: () => api.get('/timetable/student/schedules/my_schedule/').then(r => r.data),

  // Teacher Schedules
  getTeacherSchedules: (params = {}) => api.get('/timetable/teacher/schedules/', { params }).then(r => r.data),
  getMyTeacherSchedules: () => api.get('/timetable/teacher/schedules/my_schedules/').then(r => r.data),

  // Time Slots (if available)
  getTimeSlots: (params = {}) => api.get('/timetable/timeslots/', { params }).then(r => r.data),

  // Availabilities (if available)
  getAvailabilities: (params = {}) => api.get('/timetable/availabilities/', { params }).then(r => r.data),
  createAvailability: (data) => api.post('/timetable/availabilities/', data).then(r => r.data),
  updateAvailability: (id, data) => api.patch(`/timetable/availabilities/${id}/`, data).then(r => r.data),
  deleteAvailability: (id) => api.delete(`/timetable/availabilities/${id}/`).then(r => r.data),
}

export default timetableService