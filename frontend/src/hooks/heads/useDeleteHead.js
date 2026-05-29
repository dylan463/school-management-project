import { useMutation, useQueryClient } from '@tanstack/react-query'
import { headSevices } from '../../services/portalService'

export const useDeleteHead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: headSevices.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['heads'],
      })
    },
  })
}