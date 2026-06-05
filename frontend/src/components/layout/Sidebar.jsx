import { NavLink } from 'react-router-dom'
import { ROUTES, ROLES } from '../../utils/constants'
import { useAuth } from '../../context/AuthContext'

/* ── Icon components ── */
const Icon = ({ d }) => (
  <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16">
    <path d={d} stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DashIcon = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" /></svg>
const CalIcon = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.3" /><path d="M1.5 6h13M5 1.5V4M11 1.5V4" stroke="currentColor" strokeWidth="1.2" /></svg>
const NoteIcon = () => <Icon d="M2 4h12M2 7.5h12M2 11h7" />
const FileIcon = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><path d="M3.5 2h5l4 4v8a1 1 0 01-1 1h-8a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" /><path d="M8.5 2v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
const ClockIcon = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" /><path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
const UsersIcon = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3" /><path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /><path d="M11 7a2.5 2.5 0 110-5M15 13a4 4 0 00-4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
const LogoutIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 5l3 3-3 3M13 8H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
const GearIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16"><path d="M6.5 1.5h3l.4 1.6a5.5 5.5 0 011.2.7l1.5-.5 1.5 2.6-1.1 1a5.7 5.7 0 010 1.4l1.1 1-1.5 2.6-1.5-.5a5.5 5.5 0 01-1.2.7l-.4 1.6h-3l-.4-1.6a5.5 5.5 0 01-1.2-.7l-1.5.5-1.5-2.6 1.1-1a5.7 5.7 0 010-1.4l-1.1-1 1.5-2.6 1.5.5a5.5 5.5 0 011.2-.7L6.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" /></svg>
const BookIcon = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><path d="M2 2h4.5a1.5 1.5 0 011.5 1.5V14l-1-.5L5.5 13 4 13.5 2.5 13 1 13.5V3.5A1.5 1.5 0 012.5 2zM14 2H9.5A1.5 1.5 0 008 3.5V14l1-.5 1.5.5L12 13.5 13.5 13 15 13.5V3.5A1.5 1.5 0 0014 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
const CheckIcon = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><path d="M2 8.5l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
const RepeatIcon = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><path d="M12 2l2 2-2 2M4 14l-2-2 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 4H6a4 4 0 00-4 4M2 12h8a4 4 0 004-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
const LayerIcon = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><path d="M8 1L1 5l7 4 7-4-7-4zM1 8l7 4 7-4M1 11l7 4 7-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
const ImportIcon = () => <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 16 16"><path d="M8 1v10M5 8l3 3 3-3M2 14h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>

/* ── Nav items per role ── */

const STUDENT_NAV = [
  { label: 'Tableau de bord', to: ROUTES.DASHBOARDSTUDENT, iconComponent: DashIcon },
  { label: 'Emplois du Temps', to: ROUTES.SCHEDULE, iconComponent: CheckIcon },
  { label: "Unités d'ens.", to: ROUTES.COURSEUNITS, iconComponent: BookIcon },
  { label: 'Modules', to: ROUTES.COURSEMODULES, iconComponent: NoteIcon },
  { label: 'Examens', to: ROUTES.ASSESSMENTS, iconComponent: FileIcon },
  { label: 'Résultats', to: ROUTES.RESULTS, iconComponent: CheckIcon },
  { label: 'Historiques', to: ROUTES.HISTORY, iconComponent: ClockIcon },
  { label: 'Profil', to: ROUTES.PROFIL, iconComponent: GearIcon },
]

const TEACHER_NAV = [
  { label: 'Tableau de bord', to: ROUTES.DASHBOARDTEACHER, iconComponent: DashIcon },
  { label: 'Emplois du Temps', to: ROUTES.SCHEDULE, iconComponent: CheckIcon },
  { label: "Unités d'ens.", to: ROUTES.COURSEUNITS, iconComponent: BookIcon },
  { label: 'Modules', to: ROUTES.COURSEMODULES, iconComponent: NoteIcon },
  { label: 'Examens', to: ROUTES.ASSESSMENTS, iconComponent: FileIcon },
  { label: 'Résultats', to: ROUTES.RESULTS, iconComponent: CheckIcon },
  { label: 'Profil', to: ROUTES.PROFIL, iconComponent: GearIcon },
]

const HEAD_NAV = [
  { label: 'Tableau de bord', to: ROUTES.DASHBOARDMANAGEMENT, iconComponent: DashIcon },
  { label: 'Emplois du Temps', to: ROUTES.SCHEDULE, iconComponent: CheckIcon },
  { label: 'Secrétaires', to: ROUTES.SECRETARIES, iconComponent: UsersIcon },
  { label: 'Officiers', to: ROUTES.OFFICERS, iconComponent: UsersIcon },
  { label: 'Étudiants', to: ROUTES.STUDENTS, iconComponent: UsersIcon },
  { label: 'Enseignants', to: ROUTES.TEACHERS, iconComponent: UsersIcon },
  { label: 'Années scolaires', to: ROUTES.SCHOOLYEARS, iconComponent: CalIcon },
  { label: 'Parcours', to: ROUTES.FORMATIONS, iconComponent: FileIcon },
  { label: 'Semestres', to: ROUTES.SEMESTERS, iconComponent: CalIcon },
  { label: "Unités d'ens.", to: ROUTES.COURSEUNITS, iconComponent: BookIcon },
  { label: 'Modules', to: ROUTES.COURSEMODULES, iconComponent: NoteIcon },
  { label: 'Examens', to: ROUTES.ASSESSMENTS, iconComponent: FileIcon },
  { label: 'Résultats', to: ROUTES.RESULTS, iconComponent: CheckIcon },
  { label: 'Historiques', to: ROUTES.HISTORY, iconComponent: ClockIcon },
  { label: 'Délibérations', to: ROUTES.DELIBERATIONS, iconComponent: CheckIcon },
  { label: 'Réinscriptions', to: ROUTES.REENROLLMENT, iconComponent: RepeatIcon },
  { label: 'Importations', to: ROUTES.IMPORTJOBS, iconComponent: ImportIcon },
  { label: 'Profil', to: ROUTES.PROFIL, iconComponent: GearIcon },
]

const SECRETARY_NAV = [
  { label: 'Tableau de bord', to: ROUTES.DASHBOARDMANAGEMENT, iconComponent: DashIcon },
  { label: 'Emplois du Temps', to: ROUTES.SCHEDULE, iconComponent: CheckIcon },
  { label: 'Étudiants', to: ROUTES.STUDENTS, iconComponent: UsersIcon },
  { label: 'Enseignants', to: ROUTES.TEACHERS, iconComponent: UsersIcon },
  { label: 'Années scolaires', to: ROUTES.SCHOOLYEARS, iconComponent: CalIcon },
  { label: 'Parcours', to: ROUTES.FORMATIONS, iconComponent: FileIcon },
  { label: 'Semestres', to: ROUTES.SEMESTERS, iconComponent: CalIcon },
  { label: "Unités d'ens.", to: ROUTES.COURSEUNITS, iconComponent: BookIcon },
  { label: 'Modules', to: ROUTES.COURSEMODULES, iconComponent: NoteIcon },
  { label: 'Examens', to: ROUTES.ASSESSMENTS, iconComponent: FileIcon },
  { label: 'Résultats', to: ROUTES.RESULTS, iconComponent: CheckIcon },
  { label: 'Historiques', to: ROUTES.HISTORY, iconComponent: ClockIcon },
  { label: 'Délibérations', to: ROUTES.DELIBERATIONS, iconComponent: CheckIcon },
  { label: 'Réinscriptions', to: ROUTES.REENROLLMENT, iconComponent: RepeatIcon },
  { label: 'Profil', to: ROUTES.PROFIL, iconComponent: GearIcon },
]

const OFFICER_NAV = [
  { label: 'Tableau de bord', to: ROUTES.DASHBOARDMANAGEMENT, iconComponent: DashIcon },
  { label: 'Historiques', to: ROUTES.HISTORY, iconComponent: ClockIcon },
  { label: 'Profil', to: ROUTES.PROFIL, iconComponent: GearIcon },
]

const SYS_ADMIN_NAV = [
  { label: 'Mentions et Chefs', to: ROUTES.MENTIONS_AND_HEADS, iconComponent: UsersIcon },
  { label: 'Profil', to: ROUTES.PROFIL, iconComponent: GearIcon },
]

/* ── Nav resolver ── */
const getNavForRole = (role) => {
  switch (role) {
    case ROLES.STUDENT: return STUDENT_NAV
    case ROLES.TEACHER: return TEACHER_NAV
    case ROLES.DEPARTMENT_HEAD: return HEAD_NAV
    case ROLES.DEPARTMENT_SECRETARY: return SECRETARY_NAV
    case ROLES.REGISTRAR_OFFICER: return OFFICER_NAV
    case ROLES.SYSTEM_ADMIN: return SYS_ADMIN_NAV
    default: return []
  }
}

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
        `flex items-center gap-2.5 px-4 py-2 text-[13px] transition-all duration-100 rounded mb-[4px]
         ${isActive
          ? 'text-white bg-[#e42f24] border-white'
          : 'text-slate-500 hover:bg-slate-100 border-transparent'
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
  const { user, role, logout } = useAuth()
  const title = `Gestion administratif`
  const Nav = getNavForRole(role)

  return (
    <aside className="w-52 bg-gradient-to-b from-white to-white flex flex-col flex-shrink-0 min-h-screen shadow-lg shadow-black/10 z-10 relative">
      <div className="px-4 py-4 border-b border-black/[0.1]">
        <h1 className="text-lg font-bold text-slate-500">{title}</h1>
      </div>
      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto ml-1 mr-1">
        {Nav.map(item => (
          <SidebarItem key={item.to} {...item} />
        ))}
      </nav>

      {/* Footer / logout */}
      <div className="p-3 border-t border-black-100">
        <div className="flex items-center gap-2 px-1 mb-2">
          <div className="w-6 h-6 bg-black/20 rounded-full flex items-center justify-center">
          </div>
          <div className='text-[10px] font-semibold text-slate-500'>
            {user ? `${user.first_name} ${user.last_name}` : "Non authentifiée"}
          </div>
          <div className="flex-1 min-w-0">
            {user && <p className="text-[10px] text-red-500 truncate">{user?.username}</p>}
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 hover:text-black hover:bg-slate-100 rounded-lg transition-all"
        >
          <LogoutIcon />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}