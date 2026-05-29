import { useMutation, useQueryClient } from '@tanstack/react-query'
import { officerSevices } from '../../services/portalService'

export const useUpdateHead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: officerSevices.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['heads'],
      })
    },
  })
}