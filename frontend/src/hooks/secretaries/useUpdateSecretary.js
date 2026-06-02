import { useMutation, useQueryClient } from '@tanstack/react-query'
import { secretarySevices } from '../../services/portalService'

export const useUpdateSecretary = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: secretarySevices.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['secretaries'],
      })
    },
  })
}