export const ROLES = {
  ETUDIANT:      'etudiant',
  ENSEIGNANT:    'enseignant',
  TEACHER_ADMIN: 'teach-admin',
}

export const ROUTES = {
  // Auth
  HOME:               '/',
  LOGIN:              '/login',
  FORGOT_PASSWORD:    '/forgot-password',

  // Étudiant
  DASHBOARD_ETU:         '/dashboard-etudiant',
  INSCRIPTIONS_ETU:      '/dashboard-etudiant/inscriptions',
  MES_COURS_ETU:         '/dashboard-etudiant/mes-cours',
  EMPLOI_DU_TEMPS_ETU:   '/dashboard-etudiant/emploi-du-temps',

  // Enseignant
  DASHBOARD_ENS:         '/dashboard-enseignant',
  MES_ETUDIANTS:         '/dashboard-enseignant/mes-etudiants',
  MES_ANNOTATIONS:       '/dashboard-enseignant/mes-annotations',

  // Teacher Admin
  DASHBOARD_ADMIN:       '/admin',
  ETUDIANTS_ADMIN:       '/admin/etudiants',
  ENSEIGNANTS_ADMIN:     '/admin/enseignants',
  STRUCTURES_ADMIN:      '/admin/structures',
  ENSEIGNEMENT_ADMIN:    '/admin/enseignement',
  INSCRIPTIONS_ADMIN:    '/admin/inscriptions',
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