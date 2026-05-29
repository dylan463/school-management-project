import { useMutation, useQueryClient } from '@tanstack/react-query'
import { enrollmentService } from '../../services/assessmentsService'

export const useUpdateEnrollment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: enrollmentService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['enrollments'],
      })
    },
  })
}
