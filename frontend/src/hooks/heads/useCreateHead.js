import { useMutation, useQueryClient } from '@tanstack/react-query'
import { headSevices } from '../../services/portalService'

export const useCreateHead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: headSevices.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['heads'],
      })
    },
  })
}