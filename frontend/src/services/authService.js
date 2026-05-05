import api from './api'

const authService = {
  me: () => api.get("/auth/users/me/").then(r => r.data),
  refresh: (token) => api.post("/auth/refresh/", { refresh: token }).then(r => r.data),
  login: (matricule, password) => api.post("/auth/login/", { username: matricule, password }).then(r => r.data),
  changePassword: (data) => api.post("/auth/change-password/", data).then(r => r.data),
  requestPasswordReset: (email) => api.post("/auth/password-reset/", { email }).then(r => r.data),
  confirmPasswordReset: (data) => api.post("/auth/password-reset-confirm/", data).then(r => r.data),
}

export default authService;
