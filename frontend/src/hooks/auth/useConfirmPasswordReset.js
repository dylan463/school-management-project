import { useMutation } from '@tanstack/react-query'
import authService from '../../services/authService'

export const useConfirmPasswordReset = () => {
  return useMutation({
    mutationFn: authService.confirmPasswordReset,
  })
}
