import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teacherSevices } from '../../services/portalService'

export const useCreateHead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: teacherSevices.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['heads'],
      })
    },
  })
}