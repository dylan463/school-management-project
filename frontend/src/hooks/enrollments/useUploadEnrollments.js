import { useMutation, useQueryClient } from '@tanstack/react-query'
import { enrollmentServices } from '../../services/portalService'

export const useUploadEnrollments = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: enrollmentServices.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['importJobs'],
      })
    },
  })
}
