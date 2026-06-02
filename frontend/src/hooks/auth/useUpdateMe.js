import { useMutation,useQueryClient } from '@tanstack/react-query'
import authService from '../../services/authService'

export const useUpdateMe = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['me'],
      })
    },
  })
}