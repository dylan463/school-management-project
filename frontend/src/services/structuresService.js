import api from './api'

const structuresService = {
  // Levels
  getLevels: (params = {}) => api.get('/structures/levels/', { params }).then(r => r.data),
  getLevel: (id) => api.get(`/structures/levels/${id}/`).then(r => r.data),

  // Formations
  getFormations: (params = {}) => api.get('/structures/formations/', { params }).then(r => r.data),
  getFormation: (id) => api.get(`/structures/formations/${id}/`).then(r => r.data),

  // Semesters
  getSemesters: (params = {}) => api.get('/structures/semesters/', { params }).then(r => r.data),
  getSemester: (id) => api.get(`/structures/semesters/${id}/`).then(r => r.data),

  // School Years
  getSchoolYears: (params = {}) => api.get('/structures/school_years/', { params }).then(r => r.data),
  getSchoolYear: (id) => api.get(`/structures/school_years/${id}/`).then(r => r.data),

  // Course Units
  getCourseUnits: (params = {}) => api.get('/structures/course_units/', { params }).then(r => r.data),
  getCourseUnit: (id) => api.get(`/structures/course_units/${id}/`).then(r => r.data),

  // Course Modules
  getCourseModules: (params = {}) => api.get('/structures/course_modules/', { params }).then(r => r.data),
  getCourseModule: (id) => api.get(`/structures/course_modules/${id}/`).then(r => r.data),
}

export default structuresService