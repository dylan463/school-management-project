import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROUTES, ROLES } from '../../utils/constants'
import { useEffect } from 'react'


export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(role === ROLES.ENSEIGNANT ? ROUTES.DASHBOARD_ENS : ROUTES.DASHBOARD_ETU, { replace: true })
    }
  }, [isAuthenticated, role, navigate])

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center relative"
      style={{ backgroundImage: "url('src/assets/Departement.jpeg')" }}
    >
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="w-full max-w-3xl bg-white/20 rounded-2xl p-10 text-center shadow-xl relative z-10">
        
        {/* Logo et titre centré */}
        <div className="flex flex-col items-center mb-10">
          <img
            src="src/assets/espa.png" // 🔹 Remplace par le chemin réel du logo importé
            alt="Logo ESPA"
            className="w-20 h-20 mb-3"
          />
          <span className="text-lg font-bold text-white uppercase tracking-wide">
            ÉCOLE SUPÉRIEURE POLYTECHNIQUE D’ANTANANARIVO
          </span>
        </div>

        {/* Hero text */}
        <h1 className="text-4xl font-extrabold text-white leading-snug mb-5 tracking-wide">
          PLATEFORME DE GESTION DE MENTION <br/>
          <span className="text-2xl italic font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent drop-shadow-sm font-serif">
           TELECOMMUNICATION
          </span>
        </h1>

        <p className="text-sm text-gray-100 leading-relaxed mb-8 max-w-md mx-auto">
          Accédez à vos cours, notes, emploi du temps et ressources pédagogiques depuis un espace centralisé et sécurisé.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white px-10 py-3 rounded-xl text-sm font-semibold transition-all duration-150 shadow-lg shadow-blue-500/30"
        >
          Login
        </button>

      </div>
    </div>
  )
}
