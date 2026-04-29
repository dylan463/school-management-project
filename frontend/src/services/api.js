// api.js
import axios from "axios";
import { storage } from "../utils/storage";
import { ROUTES } from "../utils/constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor ─────────────────────────────────────────────────────
// Injecte l'access token sur chaque requête
api.interceptors.request.use((config) => {
  const token = storage.getAccess();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// ── Response interceptor ────────────────────────────────────────────────────
// Sur 401 : tente un refresh, relance la requête, sinon redirige vers login
let isRefreshing = false;
let pendingQueue = []; // requêtes en attente pendant le refresh

const resolvePending = (newToken) =>
  pendingQueue.forEach(({ resolve }) => resolve(newToken));

const rejectPending = (err) =>
  pendingQueue.forEach(({ reject }) => reject(err));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Ignore si c'est pas un 401, ou si c'est déjà une requête de refresh
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Si un refresh est déjà en cours, met la requête en file d'attente
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) => {
        original.headers["Authorization"] = `Bearer ${newToken}`;
        return api(original);
      });
    }

    // Lance le refresh
    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = storage.getRefresh();
      if (!refreshToken) throw new Error("No refresh token");

      // Appel direct axios pour éviter de passer par l'interceptor
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/token/refresh/`,
        { refresh: refreshToken }
      );

      storage.setAccess(data.access);
      storage.setRefresh(data.refresh); // ✅ rotation

      // Relance toutes les requêtes en attente avec le nouveau token
      resolvePending(data.access);

      original.headers["Authorization"] = `Bearer ${data.access}`;
      return api(original);
    } catch (refreshError) {
      rejectPending(refreshError);
      storage.clear();
      window.location.href = ROUTES.LOGIN;
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
      pendingQueue = [];
    }
  }
);

export default api;