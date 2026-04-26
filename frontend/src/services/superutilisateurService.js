import api from "./api";

const superutilisateurService = {
  // Gestion des étudiants
  getStudents: (params) => api.get('/structures/admin/students/', { params }).then(r => r.data),
  getStudentById: (id) => api.get(`/structures/admin/students/${id}/`).then(r => r.data),
  createStudent: (data) => api.post('/structures/admin/students/', data).then(r => r.data),
  updateStudent: (id, data) => api.patch(`/structures/admin/students/${id}/`, data).then(r => r.data),
  deleteStudent: (id) => api.delete(`/structures/admin/students/${id}/`).then(r => r.data),

  // Gestion des enseignants
  getTeachers: (params) => api.get('/structures/admin/teachers/', { params }).then(r => r.data),
  getTeacherById: (id) => api.get(`/structures/admin/teachers/${id}/`).then(r => r.data),
  createTeacher: (data) => api.post('/structures/admin/teachers/', data).then(r => r.data),
  updateTeacher: (id, data) => api.patch(`/structures/admin/teachers/${id}/`, data).then(r => r.data),
  deleteTeacher: (id) => api.delete(`/structures/admin/teachers/${id}/`).then(r => r.data),
  getTeachersWithoutModules: () => api.get('/structures/admin/teachers/nomodules/').then(r => r.data),

  // Gestion des niveaux
  getLevels: () => api.get('/structures/levels/').then(r => r.data),
  createLevel: (data) => api.post('/structures/levels/', data).then(r => r.data),
  updateLevel: (id, data) => api.patch(`/structures/levels/${id}/`, data).then(r => r.data),
  deleteLevel: (id) => api.delete(`/structures/levels/${id}/`).then(r => r.data),
  popLevel: () => api.delete('/structures/levels/pop/').then(r => r.data),

  // Gestion des formations
  getFormations: () => api.get('/structures/formations/').then(r => r.data),
  getFormationById: (id) => api.get(`/structures/formations/${id}/`).then(r => r.data),
  createFormation: (data) => api.post('/structures/formations/', data).then(r => r.data),
  updateFormation: (id, data) => api.patch(`/structures/formations/${id}/`, data).then(r => r.data),
  deleteFormation: (id) => api.delete(`/structures/formations/${id}/`).then(r => r.data),
  getFormationLevels: (id) => api.get(`/structures/formations/${id}/levels/`).then(r => r.data),
  assignLevelsToFormation: (id, data) => api.post(`/structures/formations/${id}/assign-levels/`, data).then(r => r.data),
  removeLevelsFromFormation: (id) => api.post(`/structures/formations/${id}/remove-levels/`).then(r => r.data),

  // Gestion des semestres
  getSemesters: () => api.get('/structures/semesters/').then(r => r.data),
  updateSemester: (id, data) => api.patch(`/structures/semesters/${id}/`, data).then(r => r.data),
  getSemesterStudents: (id) => api.get(`/structures/semesters/${id}/students/`).then(r => r.data),

  // Gestion des années scolaires
  getSchoolYears: () => api.get('/structures/school_years/').then(r => r.data),
  getSchoolYearById: (id) => api.get(`/structures/school_years/${id}/`).then(r => r.data),
  createSchoolYear: (data) => api.post('/structures/school_years/', data).then(r => r.data),
  updateSchoolYear: (id, data) => api.patch(`/structures/school_years/${id}/`, data).then(r => r.data),
  deleteSchoolYear: (id) => api.delete(`/structures/school_years/${id}/`).then(r => r.data),
  activateSchoolYear: (id) => api.post(`/structures/school_years/${id}/activate/`).then(r => r.data),
  endSchoolYear: (id) => api.post(`/structures/school_years/${id}/end/`).then(r => r.data),
  toggleSchoolYearLock: (id) => api.post(`/structures/school_years/${id}/toggle_lock/`).then(r => r.data),
  goToFirstPeriod: (id) => api.post(`/structures/school_years/${id}/go-first/`).then(r => r.data),
  goToSecondPeriod: (id) => api.post(`/structures/school_years/${id}/go-seconde/`).then(r => r.data),
  getOpenedSchoolYears: () => api.get('/structures/school_years/opened/').then(r => r.data),

  // Gestion des inscriptions annuelles
  getStudentSchoolYears: () => api.get('/structures/student_school_years/').then(r => r.data),
  promoteRepeat: (data) => api.post('/structures/student_school_years/promote_repeat/', data).then(r => r.data),
  forceCreateStudentSchoolYear: (data) => api.post('/structures/student_school_years/force_create/', data).then(r => r.data),
  getStudentLatestSchoolYear: (data) => api.post('/structures/student_school_years/student-latest/', data).then(r => r.data),

  // Gestion des inscriptions par semestre
  getEnrollments: () => api.get('/structures/enrollments/').then(r => r.data),
  changeEnrollmentDecision: (id, data) => api.post(`/structures/enrollments/${id}/change_decision/`, data).then(r => r.data),

  // Gestion des unités d'enseignement
  getCourseUnits: () => api.get('/structures/course_units/').then(r => r.data),
  getCourseUnitById: (id) => api.get(`/structures/course_units/${id}/`).then(r => r.data),
  createCourseUnit: (data) => api.post('/structures/course_units/', data).then(r => r.data),
  updateCourseUnit: (id, data) => api.patch(`/structures/course_units/${id}/`, data).then(r => r.data),
  deleteCourseUnit: (id) => api.delete(`/structures/course_units/${id}/`).then(r => r.data),

  // Gestion des modules de cours
  getCourseModules: () => api.get('/structures/course_modules/').then(r => r.data),
  getCourseModuleById: (id) => api.get(`/structures/course_modules/${id}/`).then(r => r.data),
  createCourseModule: (data) => api.post('/structures/course_modules/', data).then(r => r.data),
  updateCourseModule: (id, data) => api.patch(`/structures/course_modules/${id}/`, data).then(r => r.data),
  deleteCourseModule: (id) => api.delete(`/structures/course_modules/${id}/`).then(r => r.data),
  assignTeacherToModule: (id, data) => api.post(`/structures/course_modules/${id}/assign_teacher/`, data).then(r => r.data),

  // Gestion des disponibilités enseignants
  getTeacherAvailabilities: (params) => api.get('/timetable/availabilities/', { params }).then(r => r.data),

  // Gestion des emplois du temps
  getTimeSlots: (params) => api.get('/timetable/timeslots/', { params }).then(r => r.data),
  createTimeSlot: (data) => api.post('/timetable/timeslots/', data).then(r => r.data),
  updateTimeSlot: (id, data) => api.patch(`/timetable/timeslots/${id}/`, data).then(r => r.data),
  deleteTimeSlot: (id) => api.delete(`/timetable/timeslots/${id}/`).then(r => r.data),
  publishTimeSlot: (id) => api.post(`/timetable/timeslots/${id}/publish/`).then(r => r.data),
  publishAllTimeSlots: (semester) => api.post('/timetable/timeslots/publish_all/', {}, { params: { semester } }).then(r => r.data),

  // Gestion des utilisateurs
  getUsers: () => api.get('/auth/users/').then(r => r.data),
  getUserProfile: () => api.get('/auth/users/me/').then(r => r.data),
  updateUserProfile: (data) => api.patch('/auth/users/me/', data).then(r => r.data),
  changePassword: (data) => api.post('/auth/change-password/', data).then(r => r.data),
};

export default superutilisateurService;