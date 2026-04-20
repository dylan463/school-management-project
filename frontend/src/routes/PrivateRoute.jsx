import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../utils/constants'

/**
 * PrivateRoute — blocks unauthenticated users
 * Wraps children with <Outlet /> so it works with nested routes.
 */
export default function PrivateRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <Outlet />
}