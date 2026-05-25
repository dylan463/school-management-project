export const ROLES = {
  SYSTEM_ADMIN        : 'system_admin',
  DEPARTMENT_HEAD     : 'department_head',
  DEPARTMENT_SECRETARY : 'department_secretary',
  REGISTRAR_OFFICER   : 'registrar_officer',
  TEACHER             : 'teacher',
  STUDENT             : 'student',
}

export const PAGE_SIZE = 10

export const TOKEN_KEY = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
}


export const ROUTES = {
  // Auth
  HOME:               '/',
  LOGIN:              '/login',
  FORGOT_PASSWORD:    '/forgot-password',

  // Étudiant
  DASHBOARD_ETU:         '/dashboard-etudiant',
  EMPLOI_DU_TEMPS:   '/emploi-du-temps',

  // Enseignant
  DASHBOARD_ENS:         '/dashboard-enseignant',

  // Teacher Admin
  DASHBOARD_ADMIN:       '/dashboard-admin',
  ETUDIANTS_ADMIN:       '/etudiants',
  ENSEIGNANTS_ADMIN:     '/enseignants',
  STRUCTURES_ADMIN:      '/structures',
  ENSEIGNEMENT:    '/enseignement',
  INSCRIPTIONS:    '/inscriptions',
  INFORMATIONS:    '/informations',

  HEADS_AND_MENTION: '/chefs-et-mentions',
}

export const PILL_COLORS = {
  'Validé':       'bg-green-100 text-green-800',
  'En attente':   'bg-amber-100 text-amber-800',
  'Insuffisant':  'bg-red-100   text-red-800',
  'PDF':          'bg-blue-100  text-blue-800',
  'ZIP':          'bg-green-100 text-green-800',
  'Examen':       'bg-blue-100  text-blue-800',
  'TP':           'bg-green-100 text-green-800',
}