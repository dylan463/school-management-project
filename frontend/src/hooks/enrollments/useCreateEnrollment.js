import { useMutation, useQueryClient } from '@tanstack/react-query'
import { enrollmentService } from '../../services/assessmentsService'

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: enrollmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['enrollments'],
      })
    },
  })
}
