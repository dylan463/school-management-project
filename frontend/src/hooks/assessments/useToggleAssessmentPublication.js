import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assessmentService } from '../../services/assessmentsService'

export const useToggleAssessmentPublication = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assessmentService.togglePublication,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['assessments'],
      })
    },
  })
}
