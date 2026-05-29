import { useMutation, useQueryClient } from '@tanstack/react-query'
import { enrollmentService } from '../../services/assessmentsService'

export const useChangeEnrollmentStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: enrollmentService.changeStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['enrollments'],
      })
    },
  })
}
