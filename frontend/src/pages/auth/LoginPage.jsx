import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES, ROLES } from '../../utils/constants'
import Input  from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import '../../index.css' // Assure-toi que la police Poppins est importée dans ton CSS global

export default function LoginPage() {
  const { login, loading, error, setError, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()

  const [matricule,   setMatricule]   = useState('')
  const [motDePasse,  setMotDePasse]  = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(role === ROLES.ENSEIGNANT ? ROUTES.DASHBOARD_ENS : ROUTES.DASHBOARD_ETU, { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    if (!matricule.trim() || !motDePasse.trim()) return
    login(matricule.trim(), motDePasse)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center relative font-[Poppins]"
      style={{ backgroundImage: "url('src/assets/fondlogin.jpg')" }}
    >
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        
        {/* Logo + phrase de bienvenue */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="src/assets/telecom.png"
            alt="Logo Mention Télécommunication"
            className="w-40 h-auto mb-4 drop-shadow-lg"
          />
          <p className="text-lg font-semibold text-slate-800 text-center">
            Bienvenue sur notre plateforme!
          </p>
        </div>

        {/* Formulaire */}
        <div className="w-full">
          <h2 className="text-xl font-bold text-slate-900 mb-2 text-center tracking-wide uppercase">
            Connexion
          </h2>
          <p className="text-sm text-slate-500 mb-6 text-center">
            Entrez votre matricule et votre mot de passe pour accéder.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="matricule"
              label="Matricule"
              placeholder="ex : ETU-2024-001"
              value={matricule}
              onChange={e => setMatricule(e.target.value)}
              autoComplete="username"
              required
              className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mot-de-passe" className="text-xs font-semibold text-slate-600">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="mot-de-passe"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={motDePasse}
                  onChange={e => setMotDePasse(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border text-sm font-normal text-slate-800 outline-none transition-all duration-150 bg-white placeholder:text-slate-400 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-lg">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="mt-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Connexion en cours…
                </span>
              ) : 'Se connecter'}
            </Button>
          </form>

          <p className="text-center text-[12px] text-slate-500 mt-6">
            <span 
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
            >
              Mot de passe oublié ?
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
