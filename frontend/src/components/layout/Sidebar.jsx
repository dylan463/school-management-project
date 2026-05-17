import { NavLink } from 'react-router-dom'
import { ROUTES, ROLES } from '../../utils/constants'
import { useAuth } from '../../context/AuthContext'

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
  { label: 'Tableau de bord',  to: ROUTES.DASHBOARD_ETU,         iconComponent: DashIcon},
  { label: 'enseignements',        to: ROUTES.ENSEIGNEMENT,         iconComponent: FileIcon},
  { label: 'Emploi du temps',  to: ROUTES.EMPLOI_DU_TEMPS,   iconComponent: CalIcon},
]

const ENS_NAV = [
  { label: 'Tableau de bord',  to: ROUTES.DASHBOARD_ENS,         iconComponent: DashIcon},
  { label: 'enseignements',        to: ROUTES.ENSEIGNEMENT,         iconComponent: FileIcon},
  { label: 'Emploi du temps',  to: ROUTES.EMPLOI_DU_TEMPS,   iconComponent: CalIcon},
]

const ADMIN_NAV = [
  { label: 'Tableau de bord',  to: ROUTES.DASHBOARD_ADMIN,      iconComponent: DashIcon},
  { label: 'Étudiants',        to: ROUTES.ETUDIANTS_ADMIN,      iconComponent: UsersIcon},
  { label: 'Enseignants',      to: ROUTES.ENSEIGNANTS_ADMIN,    iconComponent: UsersIcon},
  { label: 'Structures',       to: ROUTES.STRUCTURES_ADMIN,     iconComponent: FileIcon},
  { label: 'Enseignement',     to: ROUTES.ENSEIGNEMENT,   iconComponent: NoteIcon},
  { label: 'Emploi du temps',  to: ROUTES.EMPLOI_DU_TEMPS,   iconComponent: CalIcon},
  { label: 'Inscriptions',     to: ROUTES.INSCRIPTIONS,   iconComponent: FileIcon},
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
export default function Sidebar({ }) {
  const {user,role,logout} = useAuth()
  const title = "Plateform de gestion"
  let roleValue = role

  let Nav;
  if (roleValue == "STUDENT"){
    Nav = ETU_NAV;
  }else if (roleValue == "TEACHER"){
    Nav = ENS_NAV;
  }else{
    Nav = ADMIN_NAV;
  }

  return (
    <aside className="w-52 bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col flex-shrink-0 min-h-screen shadow-lg">
      <div className="px-4 py-6 border-b border-white/[0.1]">
        <h1 className="text-lg font-bold text-white">{title}</h1>
      </div>
      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {Nav.map(item => (
          <SidebarItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Footer / logout */}
      <div className="p-3 border-t border-white/[0.1]">
        <div className="flex items-center gap-2 px-1 mb-2">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
          </div>
          <div className='text-[10px] font-semibold text-white'>
            {user ? `${user.first_name} ${user.last_name}`: "Non authentifiée"}
          </div>
          <div className="flex-1 min-w-0">
            {user && <p className="text-[10px] text-blue-200 truncate">{user?.username}</p>}
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