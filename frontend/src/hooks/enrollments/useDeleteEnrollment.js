import { useMutation, useQueryClient } from '@tanstack/react-query'
import { enrollmentService } from '../../services/assessmentsService'

export const useDeleteEnrollment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: enrollmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['enrollments'],
      })
    },
  })
}
