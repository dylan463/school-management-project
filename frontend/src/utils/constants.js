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
  HOME:               '/',
  LOGIN:              '/login',
  DASHBOARD_ETU:      '/dashboard-etudiant',
  DASHBOARD_ENS:      '/dashboard-enseignant',
  NOTES:              '/dashboard-etudiant/notes',
  EMPLOI_DU_TEMPS:    '/dashboard-etudiant/emploi-du-temps',
  COURS:              '/dashboard-etudiant/cours',
  POINTAGE:           '/dashboard-etudiant/pointage',
  ETUDIANTS_LIST:     '/dashboard-enseignant/etudiants',
  SAISIE_NOTES:       '/dashboard-enseignant/saisie-notes',
  PLANNING:           '/dashboard-enseignant/planning',
  RESSOURCES:         '/dashboard-enseignant/ressources',
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