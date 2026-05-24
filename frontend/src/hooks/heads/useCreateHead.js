import { useMutation, useQueryClient } from '@tanstack/react-query'
import { headsSevices } from '../../services/usersService'

export const useCreateHead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: headsSevices.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['heads'],
      })
    },
  })
}