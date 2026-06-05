export const ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  DEPARTMENT_HEAD: 'department_head',
  DEPARTMENT_SECRETARY: 'department_secretary',
  REGISTRAR_OFFICER: 'registrar_officer',
  TEACHER: 'teacher',
  STUDENT: 'student',
}

export const PAGE_SIZE = 10

export const TOKEN_KEY = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
}

export const PAGINATION_SIZE = 10

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  RESETPASSWORD: "/reset-password",
  FORGOTPASSWORD: "/forgot-password",
  PROFIL: "/profile",
  DASHBOARDSTUDENT: "/dashboard-etudiant",
  DASHBOARDTEACHER: "/dashboard-proffesseur",
  // dashboard pour les chef de mention , officier de scholarité et secretaire
  DASHBOARDMANAGEMENT: "/dashboard-management",
  MENTIONS_AND_HEADS: "/metions-et-chef",
  SECRETARIES: "/secretaires",
  OFFICERS: "/officiers",
  TEACHERS: "/proffeseurs",
  STUDENTS: "/etudiants",
  SCHOOLYEARS: "/annees-scolaires",
  FORMATIONS: "/parcours",
  SEMESTERS: "/semestres",
  LEVELS: "/niveaux",
  COURSEUNITS: "/course-units",
  COURSEMODULES: "/course-modules",
  ASSESSMENTS: "/examens",
  GRADES: "/notes",
  RESULTS: "/resultats",
  HISTORY: "/historiques",
  DELIBERATIONS: "/deliberations",
  REENROLLMENT: "/reinscriptions",
  IMPORTJOBS: "/imports",
  SCHEDULE: "/emplois-du-temps",
  NOTIFICATIONS: "/notifications",
}

export const PILL_COLORS = {
  'Validé': 'bg-green-100 text-green-800',
  'En attente': 'bg-amber-100 text-amber-800',
  'Insuffisant': 'bg-red-100   text-red-800',
  'PDF': 'bg-blue-100  text-blue-800',
  'ZIP': 'bg-green-100 text-green-800',
  'Examen': 'bg-blue-100  text-blue-800',
  'TP': 'bg-green-100 text-green-800',
}