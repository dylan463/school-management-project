import { useMutation, useQueryClient } from '@tanstack/react-query'
import { headsSevices } from '../../services/usersService'

export const useDeleteHead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: headsSevices.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['heads'],
      })
    },
  })
}