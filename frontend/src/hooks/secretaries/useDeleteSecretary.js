import { useMutation, useQueryClient } from '@tanstack/react-query'
import { secretarySevices } from '../../services/portalService'

export const useDeleteHead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: secretarySevices.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['heads'],
      })
    },
  })
}