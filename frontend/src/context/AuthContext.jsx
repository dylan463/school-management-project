// AuthContext.jsx
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { storage } from "../utils/storage";
import authService from "../services/authService";
import { authEvents } from "../services/api";
import { ROLES, ROUTES } from "../utils/constants";

const AuthContext = React.createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [mention,setMention] = useState(null)
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Initialisation
  const [loginLoading, setLoginLoading] = useState(false); // Connexion
  const [initialized, setInitialized] = useState(false);

  const loadUser = (currentUser) => {
    setUser(currentUser)
    setRole(currentUser.role)
    setMention(currentUser.mention)
  }

  const clearUser = () => {
    setUser(null)
    setRole(null)
    setMention(null)
  }

  const logout = useCallback(() => {
    storage.clear();
    clearUser()
    setInitialized(false); // Réinitialiser pour permettre une nouvelle auth
    navigate(ROUTES.LOGIN, { replace: true });
  }, [navigate]);

  useEffect(() => {
    // Ne pas réinitialiser si déjà initialisé
    if (initialized) return;

    const initAuth = async () => {
      setLoading(true);
      try {
        if (!storage.getAccess()) {
          return;
        }

        // Si le token est expiré, l'interceptor tente le refresh automatiquement.
        const currentUser = await authService.me();
        loadUser(currentUser)

      } catch {
        // Si le refresh échoue, l'interceptor émet l'événement sessionExpired.
        storage.clear();
        clearUser()
      } finally {
        setInitialized(true);
        setLoading(false);
      }
    };

    initAuth();
  }, [initialized]);

  useEffect(() => {
    const handleSessionExpired = (event, data) => {
      if (event !== 'sessionExpired') return;

      storage.clear();
      clearUser()
      setError('Session expirée');

      if (location.pathname !== ROUTES.LOGIN) {
        navigate(ROUTES.LOGIN, { replace: true });
      }
    };

    const unsubscribe = authEvents.subscribe(handleSessionExpired);
    return unsubscribe;
  }, [navigate, location.pathname]);

  const login = useCallback(async (matricule, motDePasse) => {
    setLoginLoading(true);
    try {
      setError(null);
      const { access, refresh } = await authService.login(matricule, motDePasse);
      storage.setAccess(access);
      storage.setRefresh(refresh);
      const currentUser = await authService.me();
      loadUser(currentUser)
    } catch (err) {
      const errorMessage = "Échec de la connexion";
      setError(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  }, []);

  const value = {
    user,
    loading: loginLoading,
    role,
    login,
    logout,
    isAuthenticated: !!user,
    error,
    setError,
    mention
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
}