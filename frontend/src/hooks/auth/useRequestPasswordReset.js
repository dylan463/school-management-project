import { useMutation } from '@tanstack/react-query'
import authService from '../../services/authService'

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: authService.requestPasswordReset,
  })
}
