const TOKEN_KEY = 'espa_token'
const ROLE_KEY  = 'espa_role'
const USER_KEY  = 'espa_user'

export const storage = {
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  getToken: ()      => localStorage.getItem(TOKEN_KEY),
  removeToken: ()   => localStorage.removeItem(TOKEN_KEY),

  setRole: (role)   => localStorage.setItem(ROLE_KEY, role),
  getRole: ()       => localStorage.getItem(ROLE_KEY),
  removeRole: ()    => localStorage.removeItem(ROLE_KEY),

  setUser: (user)   => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  getUser: ()       => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) }
    catch { return null }
  },

  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(USER_KEY)
  },
}