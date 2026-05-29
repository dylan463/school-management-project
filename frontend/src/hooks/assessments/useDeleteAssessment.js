import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assessmentService } from '../../services/assessmentsService'

export const useDeleteAssessment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assessmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assessments'],
      })
    },
  })
}
