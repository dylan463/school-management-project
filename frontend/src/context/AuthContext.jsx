// AuthContext.jsx
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { storage } from "../utils/storage";
import { authEvents } from "../services/api";
import { ROUTES } from "../utils/constants";
import { useMe } from "../hooks/auth/useMe";
import { useLogin as useLoginMutation } from "../hooks/auth/useLogin";

const AuthContext = React.createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);

  // ── Récupération du profil utilisateur via useMe ─────────────────────────
  const hasToken = !!storage.getAccess();
  const { data: user, isLoading: meLoading } = useMe(hasToken);

  const role = user?.role ?? null;
  const mention = user?.mention ?? null;

  // ── Mutation de connexion via useLogin ────────────────────────────────────
  const loginMutation = useLoginMutation();

  const login = useCallback(
    async (matricule, motDePasse) => {
      setError(null);
      try {
        const { access, refresh } = await loginMutation.mutateAsync({
          matricule,
          password: motDePasse,
        });
        storage.setAccess(access);
        storage.setRefresh(refresh);
        // Rafraîchir le cache du profil utilisateur
        await queryClient.invalidateQueries({ queryKey: ["me"] });
      } catch {
        setError("Échec de la connexion");
      }
    },
    [loginMutation, queryClient]
  );

  // ── Déconnexion ──────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    storage.clear();
    queryClient.removeQueries({ queryKey: ["me"] });
    queryClient.clear();
    navigate(ROUTES.LOGIN, { replace: true });
  }, [navigate, queryClient]);

  // ── Gestion de la session expirée ────────────────────────────────────────
  useEffect(() => {
    const handleSessionExpired = (event) => {
      if (event !== "sessionExpired") return;

      storage.clear();
      queryClient.removeQueries({ queryKey: ["me"] });
      setError("Session expirée");

      if (location.pathname !== ROUTES.LOGIN) {
        navigate(ROUTES.LOGIN, { replace: true });
      }
    };

    const unsubscribe = authEvents.subscribe(handleSessionExpired);
    return unsubscribe;
  }, [navigate, location.pathname, queryClient]);

  const value = {
    user: user ?? null,
    loading: loginMutation.isPending,
    role,
    login,
    logout,
    isAuthenticated: hasToken,
    error,
    setError,
    mention,
  };

  // Attendre la fin du chargement initial avant d'afficher les enfants
  const initializing = hasToken && meLoading;

  return (
    <AuthContext.Provider value={value}>
      {initializing ? null : children}
    </AuthContext.Provider>
  );
}