import api from './api'

const enseignantService = {
  // Modules enseignés par l'enseignant
  getMyModules: () => api.get('/structures/teacher/my_modules/').then(r => r.data),

  // Étudiants des cours de l'enseignant
  getMyStudents: () => api.get('/structures/teacher/my_students/').then(r => r.data),

  // Semestres des cours de l'enseignant
  getMySemesters: () => api.get('/structures/teacher/my_semesters/').then(r => r.data),

  // Unités d'enseignement de l'enseignant
  getMyCourseUnits: () => api.get('/structures/teacher/my_course_units/').then(r => r.data),

  // Disponibilités de l'enseignant
  getAvailabilities: (semester) => api.get('/timetable/availabilities/', { params: { semester } }).then(r => r.data),
  createAvailability: (data) => api.post('/timetable/availabilities/', data).then(r => r.data),
  updateAvailability: (id, data) => api.patch(`/timetable/availabilities/${id}/`, data).then(r => r.data),
  deleteAvailability: (id) => api.delete(`/timetable/availabilities/${id}/`).then(r => r.data),

  // Emploi du temps
  getTimeSlots: () => api.get('/timetable/timeslots/').then(r => r.data),
}

export default enseignantService