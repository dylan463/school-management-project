import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'
import { storage } from '../utils/storage'
import { ROLES, ROUTES } from '../utils/constants'

const AuthContext = createContext(null)

// ─── Comptes de test (mode mock — sans backend) ───────────────────────────────
const MOCK_USERS = {
  'ETU-2024-001': {
    password: '1234',
    token:    'mock-token-etudiant',
    role:     ROLES.ETUDIANT,
    user:     { id: 'etu-1', matricule: 'ETU-2024-001', nom: 'Rakoto', prenom: 'Ny Aina', email: 'rakoto@espa.mg', semestre: 3 },
  },
  'ENS-0089': {
    password: '1234',
    token:    'mock-token-enseignant',
    role:     ROLES.ENSEIGNANT,
    user:     { matricule: 'ENS-0089', nom: 'Razafindrakoto', prenom: 'Jean', email: 'razafindrakoto@espa.mg' },
  },
}

const IS_MOCK = import.meta.env.VITE_MOCK_MODE === 'true'

async function mockLogin(matricule, motDePasse) {
  await new Promise(r => setTimeout(r, 800)) // simule un délai réseau
  const account = MOCK_USERS[matricule]
  if (!account || account.password !== motDePasse) {
    throw new Error('Identifiants incorrects. Utilisez ETU-2024-001/1234 ou ENS-0089/1234')
  }
  return { token: account.token, role: account.role, user: account.user }
}
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [role,    setRole]    = useState(null)
  const [token,   setToken]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const navigate = useNavigate()

  // Valide le token au démarrage
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = storage.getToken()
      
      if (storedToken) {
        try {
          // Teste le token avec l'endpoint /auth/me
          const response = await authService.validateToken()
          if (response) {
            // Token valide, restaure la session
            setToken(storedToken)
            setRole(storage.getRole())
            setUser(storage.getUser())
          } else {
            // Token invalide, le nettoye
            storage.clear()
          }
        } catch (err) {
          // Token expiré ou invalide
          storage.clear()
        }
      }
      setLoading(false)
    }
    
    validateToken()
  }, [])

  const isAuthenticated = !!token

  const login = useCallback(async (matricule, motDePasse) => {
    setLoading(true)
    setError(null)
    try {
      // Utilise le mock si VITE_MOCK_MODE=true, sinon appelle le vrai backend
      const data = IS_MOCK
        ? await mockLogin(matricule, motDePasse)
        : await authService.login(matricule, motDePasse)

      storage.setToken(data.token)
      storage.setRole(data.role)
      storage.setUser(data.user)
      setToken(data.token)
      setRole(data.role)
      setUser(data.user)

      if (data.role === ROLES.ETUDIANT) {
        navigate(ROUTES.DASHBOARD_ETU)
      } else if (data.role === ROLES.ENSEIGNANT) {
        navigate(ROUTES.DASHBOARD_ENS)
      } else if (data.role === ROLES.TEACHER_ADMIN) {
        navigate(ROUTES.DASHBOARD_ADMIN)
      }
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Identifiants incorrects.')
    } finally {
      setLoading(false)
    }
  }, [navigate])

  const logout = useCallback(async () => {
    if (!IS_MOCK) await authService.logout().catch(() => {})
    storage.clear()
    setToken(null)
    setRole(null)
    setUser(null)
    navigate(ROUTES.LOGIN)
  }, [navigate])

  const value = {
    user, setUser, role, token,
    loading, error, setError,
    isAuthenticated,
    login, logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}