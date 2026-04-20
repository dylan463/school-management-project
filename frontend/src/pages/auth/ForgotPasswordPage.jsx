import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../utils/constants'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setMessage('Un email de réinitialisation a été envoyé si l\'adresse existe.')
      setLoading(false)
    }, 2000)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center relative"
      style={{ backgroundImage: "url('src/assets/fondlogin.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        
        <div className="flex flex-col items-center mb-6">
          <img
            src="src/assets/telecom.png"
            alt="Logo Mention Télécommunication"
            className="w-40 h-auto mb-4 drop-shadow-lg"
          />
          <p className="text-lg font-semibold text-slate-800 text-center">
            Réinitialiser votre mot de passe
          </p>
        </div>

        <div className="w-full">
          <h2 className="text-xl font-semibold text-slate-900 mb-2 text-center">Mot de passe oublié</h2>
          <p className="text-sm text-slate-500 mb-6 text-center">
            Entrez votre email pour recevoir un lien de réinitialisation.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            {message && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2.5 rounded-lg">
                {message}
              </div>
            )}

            <Button type="submit" variant="navy" fullWidth disabled={loading} className="mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Envoi en cours…
                </span>
              ) : 'Envoyer le lien'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="text-blue-600 hover:underline"
            >
              Retour à la connexion
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}