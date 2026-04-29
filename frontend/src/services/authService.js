import api from './api'

const authService = {
  me: () => api.get("/auth/users/me/").then(r => r.data),
  refresh: (token) => api.post("/auth/refresh/", { refresh: token }).then(r => r.data),
  login: (matricule, password) => api.post("/auth/login/", { username: matricule, password:password }).then(r => r.data),
};

export default authService;