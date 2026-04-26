import api from './api'

const etudiantService = {
  // Informations sur l'année scolaire actuelle
  getCurrentYear: () => api.get('/structures/student/current_year/').then(r => r.data),

  // Informations sur le semestre actuel
  getCurrentSemester: () => api.get('/structures/student/current_semester/').then(r => r.data),

  // Unités d'enseignement du semestre actuel
  getMyCourseUnits: () => api.get('/structures/student/my_course_units/').then(r => r.data),

  // Camarades de classe
  getClassmates: () => api.get('/structures/student/classmates/').then(r => r.data),

  // Résumé de la progression
  getProgressSummary: () => api.get('/structures/student/progress_summary/').then(r => r.data),

  // Emploi du temps (timetable)
  getTimeSlots: (semester) => api.get('/timetable/timeslots/', { params: { semester } }).then(r => r.data),
}

export default etudiantService