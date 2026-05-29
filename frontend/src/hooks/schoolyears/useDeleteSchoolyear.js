import { useMutation, useQueryClient } from '@tanstack/react-query'
import { schoolyearService } from '../../services/structuresService'

export const useDeleteSchoolyear = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: schoolyearService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['schoolyears'],
      })
    },
  })
}
