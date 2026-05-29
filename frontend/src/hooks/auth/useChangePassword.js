import { useMutation } from '@tanstack/react-query'
import authService from '../../services/authService'

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authService.changePassword,
  })
}
