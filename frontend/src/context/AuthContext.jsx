// AuthContext.jsx
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { storage } from "../utils/storage";
import authService from "../services/authService";
import { ROLES, ROUTES } from "../utils/constants";

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
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
          setInitialized(true);
          setLoading(false);
          return;
        }
        // Si le token est expiré, l'interceptor gère le refresh automatiquement
        const currentUser = await authService.me();
        const currentRole = mapRoleApi(currentUser);
        setUser(currentUser);
        setRole(currentRole);
        setInitialized(true);
        // Ne pas rediriger automatiquement ici - laisser l'utilisateur naviguer librement
      } catch {
        // Refresh aussi échoué -> session invalide
        setError("Session expirée. Veuillez vous reconnecter.");
        storage.clear();
        setUser(null);
        setRole(null);
        setInitialized(true);
        navigate(ROUTES.LOGIN, { replace: true });
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [navigate, initialized]);

  const login = useCallback(async (matricule, motDePasse) => {
    const { access, refresh } = await authService.login(matricule, motDePasse);
    storage.setAccess(access);
    storage.setRefresh(refresh);
    const currentUser = await authService.me();
    const currentRole = mapRoleApi(currentUser);
    setUser(currentUser);
    setRole(currentRole);
    // Supprimer la redirection automatique après la connexion pour permettre la navigation libre
    // navigateByRole(currentRole);
  }, []);

  const value = {
    user,
    loading,
    error,
    role,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}