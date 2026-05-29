import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teacherSevices } from '../../services/portalService'

export const useDeleteHead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: teacherSevices.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['heads'],
      })
    },
  })
}