import { useMutation } from '@tanstack/react-query'
import authService from '../../services/authService'

export const useLogin = () => {
  return useMutation({
    mutationFn: ({ matricule, password }) => authService.login(matricule, password),
  })
}
