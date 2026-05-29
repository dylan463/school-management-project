import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '../utils/constants'
import { useConfirmPasswordReset } from '../hooks/auth/useConfirmPasswordReset'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { toast } from 'react-toastify'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const { mutate: confirmReset, isPending } = useConfirmPasswordReset()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas.')
      return
    }
    confirmReset(
      { token, password },
      {
        onSuccess: () => {
          toast.success('Mot de passe réinitialisé avec succès.')
          navigate(ROUTES.LOGIN, { replace: true })
        },
        onError: () => {
          toast.error('Échec de la réinitialisation. Le lien est peut-être expiré.')
        },
      }
    )
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
            Nouveau mot de passe
          </p>
        </div>

        <div className="w-full">
          <h2 className="text-xl font-semibold text-slate-900 mb-2 text-center">
            Réinitialiser le mot de passe
          </h2>
          <p className="text-sm text-slate-500 mb-6 text-center">
            Entrez votre nouveau mot de passe.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="password"
              label="Nouveau mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              id="confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="navy" fullWidth disabled={isPending} className="mt-2">
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Réinitialisation…
                </span>
              ) : (
                'Réinitialiser'
              )}
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
