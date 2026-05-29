import { useMutation, useQueryClient } from '@tanstack/react-query'
import { studentSevices } from '../../services/portalService'

export const useDeleteStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: studentSevices.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['students'],
      })
    },
  })
}
