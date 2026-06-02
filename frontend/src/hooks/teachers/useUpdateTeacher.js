import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teacherSevices } from '../../services/portalService'

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: teacherSevices.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teachers'],
      })
    },
  })
}