import { useMutation, useQueryClient } from '@tanstack/react-query'
import { officerSevices } from '../../services/portalService'

export const useDeleteOfficer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: officerSevices.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['officers'],
      })
    },
  })
}