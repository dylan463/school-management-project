import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES, ROLES } from '../../utils/constants'
import Input  from '../../components/ui/Input'
import Button from '../../components/ui/Button'
<<<<<<< HEAD
=======
import '../../index.css' // Assure-toi que la police Poppins est importée dans ton CSS global
>>>>>>> 95a80630d4f265bee20b2c4ad8927941e319003d

export default function LoginPage() {
  const { login, loading, error, setError, isAuthenticated, role } = useAuth()
  const navigate = useNavigate()

  const [matricule,   setMatricule]   = useState('')
  const [motDePasse,  setMotDePasse]  = useState('')

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
<<<<<<< HEAD
      className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center relative"
      style={{ backgroundImage: "url('src/assets/fondlogin.jpg')" }} // mets ici le chemin réel vers ton image
    >
      {/* Overlay sombre pour lisibilité (sans flou) */}
=======
      className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center relative font-[Poppins]"
      style={{ backgroundImage: "url('src/assets/fondlogin.jpg')" }}
    >
      {/* Overlay sombre */}
>>>>>>> 95a80630d4f265bee20b2c4ad8927941e319003d
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        
        {/* Logo + phrase de bienvenue */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="src/assets/telecom.png"
            alt="Logo Mention Télécommunication"
            className="w-40 h-auto mb-4 drop-shadow-lg"
          />
<<<<<<< HEAD
          <p className="text-lg font-bold text-slate-800 text-center">
            TELECOMMUNICATION
=======
          <p className="text-lg font-semibold text-slate-800 text-center">
            Bienvenue sur notre plateforme!
>>>>>>> 95a80630d4f265bee20b2c4ad8927941e319003d
          </p>
        </div>

        {/* Formulaire */}
        <div className="w-full">
<<<<<<< HEAD
          <h2 className="text-xl font-semibold text-slate-900 mb-2 text-center">Connexion</h2>
=======
          <h2 className="text-xl font-bold text-slate-900 mb-2 text-center tracking-wide uppercase">
            Connexion
          </h2>
>>>>>>> 95a80630d4f265bee20b2c4ad8927941e319003d
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
<<<<<<< HEAD
=======
              className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
>>>>>>> 95a80630d4f265bee20b2c4ad8927941e319003d
            />
            <Input
              id="mot-de-passe"
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={motDePasse}
              onChange={e => setMotDePasse(e.target.value)}
              autoComplete="current-password"
              required
<<<<<<< HEAD
=======
              className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
>>>>>>> 95a80630d4f265bee20b2c4ad8927941e319003d
            />

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-lg">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

<<<<<<< HEAD
            <Button type="submit" variant="navy" fullWidth disabled={loading} className="mt-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
=======
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="mt-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 active:scale-95"
            >
>>>>>>> 95a80630d4f265bee20b2c4ad8927941e319003d
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

<<<<<<< HEAD
          <p className="text-center text-sm text-slate-500 mt-4">
            <button
              onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
              className="text-blue-600 hover:underline"
            >
              Mot de passe oublié ?
            </button>
          </p>

          <p className="text-center text-[12px] text-slate-500 mt-2">
=======
          <p className="text-center text-[12px] text-slate-500 mt-6">
>>>>>>> 95a80630d4f265bee20b2c4ad8927941e319003d
            Problème de connexion ?{' '}
            <span className="text-blue-600 cursor-pointer hover:underline">
              Contactez l'administration
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
