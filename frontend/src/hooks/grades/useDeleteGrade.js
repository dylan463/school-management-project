import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gradeService } from '../../services/assessmentsService'

export const useDeleteGrade = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: gradeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['grades'],
      })
    },
  })
}
