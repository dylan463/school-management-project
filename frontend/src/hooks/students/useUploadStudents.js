import { useMutation, useQueryClient } from '@tanstack/react-query'
import { studentSevices } from '../../services/portalService'

export const useUploadStudents = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: studentSevices.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['importJobs'],
      })
    },
  })
}
