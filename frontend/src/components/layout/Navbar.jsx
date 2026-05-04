import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../utils/constants'
import Avatar from '../ui/Avatar'

// Map route pathname to page title
const TITLES = {
  '/dashboard-etudiant':              'Tableau de bord',
  '/dashboard-etudiant/notes':        'Mes notes',
  '/dashboard-etudiant/emploi-du-temps': 'Emploi du temps',
  '/dashboard-etudiant/cours':        'Cours en ligne',
  '/dashboard-etudiant/pointage':     'Pointage',
  '/dashboard-enseignant':            'Tableau de bord',
  '/dashboard-enseignant/etudiants':  'Mes étudiants',
  '/dashboard-enseignant/saisie-notes': 'Saisie des notes',
  '/dashboard-enseignant/planning':   'Mon planning',
  '/dashboard-enseignant/ressources': 'Ressources pédagogiques',
}

export default function Navbar() {
  const { user, role } = useAuth()
  const path  = window.location.pathname
  const title = TITLES[path] || 'Tableau de bord'

  const fullName = user ? `${user.prenom} ${user.nom}` : 'Utilisateur'
  const subtitle = user?.matricule || ''

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-[15px] font-semibold text-slate-800">{title}</h1>
    </header>
  )
}