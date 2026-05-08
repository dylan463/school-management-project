// api.js
import axios from "axios";
import { storage } from "../utils/storage";

// ── Event system for auth errors ────────────────────────────────────────────
const authEvents = {
  listeners: [],
  subscribe(callback) {
    this.listeners.push(callback);
    return () => this.listeners = this.listeners.filter(l => l !== callback);
  },
  emit(event, data) {
    this.listeners.forEach(callback => callback(event, data));
  }
};

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
let sessionExpiredNotified = false;

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
      if (!refreshToken) throw new Error("veuillez vous reconnecter.");

      // Appel direct axios pour éviter de passer par l'interceptor
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh/`,
        { refresh: refreshToken }
      );

      storage.setAccess(data.access);
      storage.setRefresh(data.refresh); // ✅ rotation
      sessionExpiredNotified = false;

      // Relance toutes les requêtes en attente avec le nouveau token
      resolvePending(data.access);

      original.headers["Authorization"] = `Bearer ${data.access}`;
      return api(original);
    } catch (refreshError) {
      rejectPending(refreshError);
      storage.clear();

      if (!sessionExpiredNotified) {
        if (refreshError.response) {
          refreshError.response.data = { detail: 'Session expirée' };
        }
        refreshError.message = 'Session expirée';
        authEvents.emit('sessionExpired', { reason: 'refresh_failed' });
        sessionExpiredNotified = true;
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
      pendingQueue = [];
    }
  }
);

export { authEvents };
export default api;