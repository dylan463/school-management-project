import { useMutation, useQueryClient } from '@tanstack/react-query'
import { gradeService } from '../../services/assessmentsService'

export const useCreateGrade = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: gradeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['grades'],
      })
    },
  })
}
