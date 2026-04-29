import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES, ROLES } from '../../utils/constants'

/* ── Icon components ── */
const Icon = ({ d }) => (
  <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16">
    <path d={d} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const DashIcon    = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>
const CalIcon     = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 6h13M5 1.5V4M11 1.5V4" stroke="currentColor" strokeWidth="1.2"/></svg>
const NoteIcon    = () => <Icon d="M2 4h12M2 7.5h12M2 11h7"/>
const FileIcon    = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><path d="M3.5 2h5l4 4v8a1 1 0 01-1 1h-8a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/><path d="M8.5 2v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const ClockIcon   = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
const BellIcon    = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><path d="M8 2a5 5 0 00-5 5v2l-1 2h12l-1-2V7a5 5 0 00-5-5zM6.5 13a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3"/></svg>
const UsersIcon   = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M11 7a2.5 2.5 0 110-5M15 13a4 4 0 00-4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
const UploadIcon  = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M8 10V3M5 6l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
const LogoutIcon  = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 5l3 3-3 3M13 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>

/* ── Nav items per role ── */
const ETU_NAV = [
  { label: 'Tableau de bord',  to: ROUTES.DASHBOARD_ETU,   iconComponent: DashIcon,  section: 'Principal' },
  { label: 'Emploi du temps',  to: ROUTES.EMPLOI_DU_TEMPS, iconComponent: CalIcon,   section: 'Académique' },
  { label: 'Mes notes',        to: ROUTES.NOTES,           iconComponent: NoteIcon,  section: null },
  { label: 'Cours en ligne',   to: ROUTES.COURS,           iconComponent: FileIcon,  section: null },
  { label: 'Pointage',         to: ROUTES.POINTAGE,        iconComponent: ClockIcon, section: null },
  { label: 'Notifications',    to: '#',                    iconComponent: BellIcon,  section: 'Système', badge: 3 },
]

const ENS_NAV = [
  { label: 'Tableau de bord',  to: ROUTES.DASHBOARD_ENS,  iconComponent: DashIcon,   section: 'Principal' },
  { label: 'Mes étudiants',    to: ROUTES.ETUDIANTS_LIST, iconComponent: UsersIcon,  section: 'Pédagogie' },
  { label: 'Saisie des notes', to: ROUTES.SAISIE_NOTES,   iconComponent: NoteIcon,   section: null },
  { label: 'Mon planning',     to: ROUTES.PLANNING,       iconComponent: CalIcon,    section: null },
  { label: 'Ressources',       to: ROUTES.RESSOURCES,     iconComponent: UploadIcon, section: null },
  { label: 'Notifications',    to: '#',                   iconComponent: BellIcon,   section: 'Système', badge: 1 },
]

const ADMIN_NAV = [
  { label: 'Tableau de bord',  to: ROUTES.DASHBOARD_ADMIN,  iconComponent: DashIcon,   section: 'Principal' },
  { label: 'Gestion des utilisateurs',    to: ROUTES.USERS_LIST, iconComponent: UsersIcon,  section: 'Administration' },
  { label: 'Gestion des classes', to: ROUTES.CLASSES_LIST,   iconComponent: NoteIcon,   section: null },
  { label: 'Gestion des matières',     to: ROUTES.MATIERES_LIST,       iconComponent: CalIcon,    section: null },
  { label: 'Gestion des salles',       to: ROUTES.Salles_LIST,     iconComponent: UploadIcon, section: null },
  { label: 'Notifications',    to: '#',                   iconComponent: BellIcon,   section: 'Système', badge: 1 },
]

/* ── SidebarItem ── */
// eslint-disable-next-line no-unused-vars
function SidebarItem({ label, to, iconComponent: IconComponent, badge }) {
  if (to === '#') {
    return (
      <div className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-blue-100 cursor-default border-l-2 border-transparent">
        <IconComponent />
        <span>{label}</span>
        {badge && <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">{badge}</span>}
      </div>
    )
  }
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-4 py-2 text-[13px] transition-all duration-100 border-l-2
         ${isActive
           ? 'text-white bg-white/[0.15] border-white'
           : 'text-blue-100 hover:text-white hover:bg-white/[0.1] border-transparent'
         }`
      }
    >
      <IconComponent />
      <span>{label}</span>
      {badge && <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">{badge}</span>}
    </NavLink>
  )
}

/* ── Main Sidebar ── */
export default function Sidebar({ role }) {
  const { logout, user , role: authRole } = useAuth()
  const nav = authRole === ROLES.ETUDIANT ? ETU_NAV : ENS_NAV

  // Group items by section
  const sections = []
  let current = null
  nav.forEach(item => {
    if (item.section !== null) {
      current = { label: item.section, items: [item] }
      sections.push(current)
    } else if (current) {
      current.items.push(item)
    }
  })

  return (
    <aside className="w-52 bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col flex-shrink-0 min-h-screen shadow-lg">
      {/* Header */}
      <div className="px-4 py-6 border-b border-white/[0.1]">
        <h1 className="text-lg font-bold text-white">
          {role === ROLES.ETUDIANT ? 'Espace étudiant' : 'Espace enseignant'}
        </h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {sections.map(sec => (
          <div key={sec.label}>
            <p className="px-4 pt-4 pb-1.5 text-[10px] font-semibold text-blue-200 uppercase tracking-widest">
              {sec.label}
            </p>
            {sec.items.map(item => (
              <SidebarItem key={item.to} {...item} />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer / logout */}
      <div className="p-3 border-t border-white/[0.1]">
        <div className="flex items-center gap-2 px-1 mb-2">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-semibold text-white">
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-white truncate">
              {user ? `${user.prenom} ${user.nom}` : 'Utilisateur'}
            </p>
            <p className="text-[10px] text-blue-200 truncate">{user?.matricule}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-blue-100 hover:text-white hover:bg-white/[0.1] rounded-lg transition-all"
        >
          <LogoutIcon />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}