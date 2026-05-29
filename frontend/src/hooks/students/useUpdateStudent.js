import { useMutation, useQueryClient } from '@tanstack/react-query'
import { studentSevices } from '../../services/portalService'

export const useUpdateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: studentSevices.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['students'],
      })
    },
  })
}
