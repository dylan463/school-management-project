import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES, ROLES } from '../utils/constants'

/**
 * RoleRoute — only lets through users whose role matches `allowedRole`
 * Props:
 *   allowedRole: 'etudiant' | 'enseignant' | 'teach-admin'
 */
export default function RoleRoute({ allowedRole }) {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />

  if (role !== allowedRole) {
    // Redirect to the correct dashboard for their role
    let fallback = ROUTES.LOGIN
    if (role === ROLES.ETUDIANT) fallback = ROUTES.DASHBOARD_ETU
    else if (role === ROLES.ENSEIGNANT) fallback = ROUTES.DASHBOARD_ENS
    else if (role === ROLES.TEACHER_ADMIN) fallback = ROUTES.DASHBOARD_ADMIN
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}