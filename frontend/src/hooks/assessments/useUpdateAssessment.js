import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assessmentService } from '../../services/assessmentsService'

export const useUpdateAssessment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assessmentService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assessments'],
      })
    },
  })
}
