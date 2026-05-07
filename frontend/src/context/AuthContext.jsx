// AuthContext.jsx
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { storage } from "../utils/storage";
import authService from "../services/authService";
import { authEvents } from "../services/api";
import { ROLES, ROUTES } from "../utils/constants";
import extractDRFError from "../utils/extractError";

const AuthContext = React.createContext();

export const useAuth = () => useContext(AuthContext);

const mapRoleApi = (apiUser) => {
  if (apiUser.is_superuser) return ROLES.SUPERUSER;
  if (apiUser.is_staff) return ROLES.STAFF;
  if (apiUser.role === ROLES.ENSEIGNANT) return ROLES.ENSEIGNANT;
  if (apiUser.role === ROLES.ETUDIANT) return ROLES.ETUDIANT;
  return null;
};

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Initialisation
  const [loginLoading, setLoginLoading] = useState(false); // Connexion
  const [initialized, setInitialized] = useState(false);

  const logout = useCallback(() => {
    storage.clear();
    setUser(null);
    setRole(null);
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
        const currentRole = mapRoleApi(currentUser);
        setUser(currentUser);
        setRole(currentRole);
      } catch {
        // Si le refresh échoue, l'interceptor émet l'événement sessionExpired.
        storage.clear();
        setUser(null);
        setRole(null);
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
      setUser(null);
      setRole(null);
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
      const currentRole = mapRoleApi(currentUser);
      setUser(currentUser);
      setRole(currentRole);

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
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
}