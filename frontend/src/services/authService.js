import api from './api'

const authService = {
  /**
   * POST /auth/login
   * Body: { matricule, mot_de_passe }
   * Response: { token, role, user }
   */
  login: async (matricule, mot_de_passe) => {
    const { data } = await api.post('/auth/login', { matricule, mot_de_passe })
    return data // { token, role, user: { matricule, nom, prenom, ... } }
  },

  logout: async () => {
    try { await api.post('/auth/logout') } catch (_) {}
  },

  me: async () => {
    const { data } = await api.get('/auth/me')
    return data
  },

  updateProfile: async (data) => {
    const { data: updated } = await api.patch('/users/me', data)
    return updated
  },

  validateToken: async () => {
    try {
      const { data } = await api.get('/auth/me')
      return data
    } catch (error) {
      return null
    }
  },
}

export default authService