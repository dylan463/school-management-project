import { useMutation, useQueryClient } from '@tanstack/react-query'
import { importJobServices } from '../../services/portalService'

export const useDeleteImportJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: importJobServices.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['importJobs'],
      })
    },
  })
}
