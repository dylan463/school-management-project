import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES, ROLES } from '../utils/constants'
import { useEffect } from 'react'
import bgImage from '../assets/Departement.jpeg'
import espaImg from '../assets/espa.png'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className="w-full max-w-3xl bg-white bg-opacity-50 rounded-2xl p-10 text-center shadow-xl backdrop-blur-sm">
        
        {/* Logo et titre centré */}
        <div className="flex flex-col items-center mb-10">
          <img
            src={espaImg}
            alt="Logo ESPA"
            className="w-20 h-20 mb-3"
          />
          <span className="text-lg font-bold text-slate-800 uppercase tracking-wide">
            ÉCOLE SUPÉRIEURE POLYTECHNIQUE D’ANTANANARIVO
          </span>
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 leading-snug mb-5 tracking-wide">
          PLATEFORME DE GESTION <br />
          <span className="text-2xl italic font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent drop-shadow-sm font-serif">
            MENTION TELECOMMUNICATION
          </span>
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed mb-8 max-w-md mx-auto">
          Accédez à vos cours, notes, emploi du temps et ressources pédagogiques depuis un espace centralisé et sécurisé.
        </p>

        <a href={ROUTES.LOGIN}>
          <button className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white px-10 py-3 rounded-xl text-sm font-semibold transition-all duration-150 shadow-lg shadow-blue-500/30">
            Login
          </button>
        </a>

      </div>
    </div>
  )
}