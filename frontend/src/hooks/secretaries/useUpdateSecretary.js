import { useMutation, useQueryClient } from '@tanstack/react-query'
import { secretarySevices } from '../../services/portalService'

export const useUpdateHead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: secretarySevices.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['heads'],
      })
    },
  })
}