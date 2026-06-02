import { useMutation, useQueryClient } from '@tanstack/react-query'
import { secretarySevices } from '../../services/portalService'

export const useCreateSecretary = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: secretarySevices.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['secretaries'],
      })
    },
  })
}