import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../utils/constants'

/**
 * PrivateRoute — blocks unauthenticated users
 * Wraps children with <Outlet /> so it works with nested routes.
 */
export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth()

  // En attente de validation du token
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Chargement...</p>
    </div>
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <Outlet />
}