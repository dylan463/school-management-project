import api from './api'

const adminService = {
  // Dashboard stats
  getDashboardStats: async () => {
    const [studentsResponse, teachersResponse, formationsResponse, enrollmentsResponse] = await Promise.all([
      api.get('/auth/structures/students'),
      api.get('/auth/structures/teachers'),
      api.get('/structures/formations'),
      api.get('/structures/enrollments'),
    ])

    return {
      students: studentsResponse.data.length,
      teachers: teachersResponse.data.length,
      structures: formationsResponse.data.length,
      inscriptions: enrollmentsResponse.data.length,
    }
  },

  // Users management
  getUsers: (params = {}) => api.get('/auth/users/', { params }).then(r => r.data),
  getUser: (id) => api.get(`/auth/users/${id}/`).then(r => r.data),
  createUser: (data) => api.post('/auth/users/', data).then(r => r.data),
  updateUser: (id, data) => api.patch(`/auth/users/${id}/`, data).then(r => r.data),
  deleteUser: (id) => api.delete(`/auth/users/${id}/`).then(r => r.data),

  // Structures management
  // Levels
  getLevels: () => api.get('/structures/levels/').then(r => r.data),
  createLevel: (data) => api.post('/structures/levels/', data).then(r => r.data),
  updateLevel: (id, data) => api.patch(`/structures/levels/${id}/`, data).then(r => r.data),
  deleteLevel: (id) => api.delete(`/structures/levels/${id}/`).then(r => r.data),

  // Formations
  getFormations: () => api.get('/structures/formations/').then(r => r.data),
  createFormation: (data) => api.post('/structures/formations/', data).then(r => r.data),
  updateFormation: (id, data) => api.patch(`/structures/formations/${id}/`, data).then(r => r.data),
  deleteFormation: (id) => api.delete(`/structures/formations/${id}/`).then(r => r.data),

  // Semesters
  getSemesters: () => api.get('/structures/semesters/').then(r => r.data),
  createSemester: (data) => api.post('/structures/semesters/', data).then(r => r.data),
  updateSemester: (id, data) => api.patch(`/structures/semesters/${id}/`, data).then(r => r.data),
  deleteSemester: (id) => api.delete(`/structures/semesters/${id}/`).then(r => r.data),

  // School Years
  getSchoolYears: () => api.get('/structures/school_years/').then(r => r.data),
  createSchoolYear: (data) => api.post('/structures/school_years/', data).then(r => r.data),
  updateSchoolYear: (id, data) => api.patch(`/structures/school_years/${id}/`, data).then(r => r.data),
  deleteSchoolYear: (id) => api.delete(`/structures/school_years/${id}/`).then(r => r.data),

  // Student School Years
  getStudentSchoolYears: () => api.get('/structures/student_school_years/').then(r => r.data),
  createStudentSchoolYear: (data) => api.post('/structures/student_school_years/', data).then(r => r.data),
  updateStudentSchoolYear: (id, data) => api.patch(`/structures/student_school_years/${id}/`, data).then(r => r.data),
  deleteStudentSchoolYear: (id) => api.delete(`/structures/student_school_years/${id}/`).then(r => r.data),

  // Enrollments
  getEnrollments: () => api.get('/structures/enrollments/').then(r => r.data),
  createEnrollment: (data) => api.post('/structures/enrollments/', data).then(r => r.data),
  updateEnrollment: (id, data) => api.patch(`/structures/enrollments/${id}/`, data).then(r => r.data),
  deleteEnrollment: (id) => api.delete(`/structures/enrollments/${id}/`).then(r => r.data),

  // Course Units
  getCourseUnits: () => api.get('/structures/course_units/').then(r => r.data),
  createCourseUnit: (data) => api.post('/structures/course_units/', data).then(r => r.data),
  updateCourseUnit: (id, data) => api.patch(`/structures/course_units/${id}/`, data).then(r => r.data),
  deleteCourseUnit: (id) => api.delete(`/structures/course_units/${id}/`).then(r => r.data),

  // Course Modules
  getCourseModules: () => api.get('/structures/course_modules/').then(r => r.data),
  createCourseModule: (data) => api.post('/structures/course_modules/', data).then(r => r.data),
  updateCourseModule: (id, data) => api.patch(`/structures/course_modules/${id}/`, data).then(r => r.data),
  deleteCourseModule: (id) => api.delete(`/structures/course_modules/${id}/`).then(r => r.data),

  // Timetable management
  // Admin Schedules
  getSchedules: () => api.get('/timetable/admin/schedules/').then(r => r.data),
  createSchedule: (data) => api.post('/timetable/admin/schedules/', data).then(r => r.data),
  updateSchedule: (id, data) => api.patch(`/timetable/admin/schedules/${id}/`, data).then(r => r.data),
  deleteSchedule: (id) => api.delete(`/timetable/admin/schedules/${id}/`).then(r => r.data),
  addScheduleEntry: (scheduleId, data) => api.post(`/timetable/admin/schedules/${scheduleId}/add_entry/`, data).then(r => r.data),
  updateScheduleEntry: (scheduleId, entryId, data) => api.patch(`/timetable/admin/schedules/${scheduleId}/update_entry/${entryId}/`, data).then(r => r.data),

  // Assessments
  getAssessments: () => api.get('/assessments/').then(r => r.data),
  createAssessment: (data) => api.post('/assessments/', data).then(r => r.data),
  updateAssessment: (id, data) => api.patch(`/assessments/${id}/`, data).then(r => r.data),
  deleteAssessment: (id) => api.delete(`/assessments/${id}/`).then(r => r.data),

  // Grades
  getGrades: () => api.get('/assessments/grades/').then(r => r.data),
  createGrade: (data) => api.post('/assessments/grades/', data).then(r => r.data),
  updateGrade: (id, data) => api.patch(`/assessments/grades/${id}/`, data).then(r => r.data),
  deleteGrade: (id) => api.delete(`/assessments/grades/${id}/`).then(r => r.data),

  // Announcements
  getAnnouncements: () => api.get('/announcements/annoncements/').then(r => r.data),
  createAnnouncement: (data) => api.post('/announcements/annoncements/', data).then(r => r.data),
  updateAnnouncement: (id, data) => api.patch(`/announcements/annoncements/${id}/`, data).then(r => r.data),
  deleteAnnouncement: (id) => api.delete(`/announcements/annoncements/${id}/`).then(r => r.data),

  // Notifications
  getNotifications: () => api.get('/notifications/').then(r => r.data),
  createNotification: (data) => api.post('/notifications/', data).then(r => r.data),
  updateNotification: (id, data) => api.patch(`/notifications/${id}/`, data).then(r => r.data),
  deleteNotification: (id) => api.delete(`/notifications/${id}/`).then(r => r.data),
}

export default adminService
