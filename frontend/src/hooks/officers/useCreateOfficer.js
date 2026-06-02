import { useMutation, useQueryClient } from '@tanstack/react-query'
import { officerSevices } from '../../services/portalService'

export const useCreateOfficer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: officerSevices.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['officers'],
      })
    },
  })
}