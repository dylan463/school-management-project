import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../utils/constants'

/**
 * RoleRoute — only lets through users whose role matches `allowedRole`
 * Props:
 *   allowedRole: 'etudiant' | 'enseignant'
 */
export default function RoleRoute({ allowedRole }) {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />

  if (role !== allowedRole) {
    // Redirect to the correct dashboard for their role
    const fallback = role === 'etudiant' ? ROUTES.DASHBOARD_ETU : ROUTES.DASHBOARD_ENS
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}