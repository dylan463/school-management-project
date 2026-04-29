import { TOKEN_KEY} from "./constants"

export const storage = {
  setAccess:(token) => localStorage.setItem(TOKEN_KEY.ACCESS, token),
  getAccess:() => localStorage.getItem(TOKEN_KEY.ACCESS),
  removeAccess:() => localStorage.removeItem(TOKEN_KEY.ACCESS),
  
  setRefresh:(token) => localStorage.setItem(TOKEN_KEY.REFRESH, token),
  getRefresh:() => localStorage.getItem(TOKEN_KEY.REFRESH),
  removeRefresh:() => localStorage.removeItem(TOKEN_KEY.REFRESH),

  clear: () => {
    localStorage.removeItem(TOKEN_KEY.ACCESS)
    localStorage.removeItem(TOKEN_KEY.REFRESH)
  },
}