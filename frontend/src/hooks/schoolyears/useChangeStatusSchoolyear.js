import { useMutation, useQueryClient } from '@tanstack/react-query'
import { schoolyearService } from '../../services/structuresService'

export const useChangeStatusSchoolyear = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: schoolyearService.changeStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['schoolyears'],
      })
    },
  })
}
