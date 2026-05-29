import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assessmentService } from '../../services/assessmentsService'

export const useCreateAssessment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assessmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assessments'],
      })
    },
  })
}
