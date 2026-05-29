import { useMutation, useQueryClient } from '@tanstack/react-query'
import { studentSevices } from '../../services/portalService'

export const useCreateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: studentSevices.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['students'],
      })
    },
  })
}
