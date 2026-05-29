import { useMutation, useQueryClient } from '@tanstack/react-query'
import { officerSevices } from '../../services/portalService'

export const useDeleteHead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: officerSevices.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['heads'],
      })
    },
  })
}