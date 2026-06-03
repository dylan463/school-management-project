import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gradeService } from '../../services/assessmentsService'

export const useUpdateGrade = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: gradeService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['grades'],
      })
      queryClient.invalidateQueries({
        queryKey: ['assessmentAttendants'],
      })
    },
  })
}
