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

<<<<<<< HEAD
      {path !== '/dashboard-etudiant' && (
        <div className="flex items-center gap-3">
          {/* Notification dot */}
          <div className="relative">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v2.5L3 13h14l-1-2.5V8a6 6 0 00-6-6zM8 15a2 2 0 004 0" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </div>

          {/* User info */}
          <div className="flex items-center gap-2">
            <Avatar name={fullName} colorIndex={role === ROLES.ETUDIANT ? 0 : 1} />
            <div className="hidden sm:block">
              <p className="text-[13px] font-medium text-slate-800 leading-tight">{fullName}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{subtitle}</p>
            </div>
          </div>
        </div>
      )}
=======
      <div className="flex items-center gap-3">
        {/* Notification dot */}
        <div className="relative">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v2.5L3 13h14l-1-2.5V8a6 6 0 00-6-6zM8 15a2 2 0 004 0" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </div>

        {/* User info */}
        <div className="flex items-center gap-2">
          <Avatar name={fullName} colorIndex={role === ROLES.ETUDIANT ? 0 : 1} />
          <div className="hidden sm:block">
            <p className="text-[13px] font-medium text-slate-800 leading-tight">{fullName}</p>
            <p className="text-[10px] text-slate-400 leading-tight">{subtitle}</p>
          </div>
        </div>
      </div>
>>>>>>> 48f443108b5c8fe935880c201f85ac819895b3a2
    </header>
  )
}