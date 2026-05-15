export const ROLES = {
  ETUDIANT:   'STUDENT',
  ENSEIGNANT: 'TEACHER',
  STAFF:      'STAFF',
  SUPERUSER:  'SUPERUSER',
}

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
  INSCRIPTIONS_ETU:      '/inscriptions',
  MES_COURS_ETU:         '/mes-cours',
  EMPLOI_DU_TEMPS_ETU:   '/emploi-du-temps',

  // Enseignant
  DASHBOARD_ENS:         '/dashboard-enseignant',
  MES_ETUDIANTS:         '/mes-etudiants',
  MES_ANNOTATIONS:       '/mes-annotations',

  // Teacher Admin
  DASHBOARD_ADMIN:       '/admin',
  ETUDIANTS_ADMIN:       '/etudiants',
  ENSEIGNANTS_ADMIN:     '/enseignants',
  STRUCTURES_ADMIN:      '/structures',
  ENSEIGNEMENT_ADMIN:    '/enseignement',
  INSCRIPTIONS_ADMIN:    '/inscriptions-admin',
  NOTIFICATIONS:         '/notifications',
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