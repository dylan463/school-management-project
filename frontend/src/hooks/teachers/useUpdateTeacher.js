import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teacherSevices } from '../../services/portalService'

export const useUpdateHead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: teacherSevices.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['heads'],
      })
    },
  })
}