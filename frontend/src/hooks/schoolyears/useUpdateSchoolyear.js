import { useMutation, useQueryClient } from '@tanstack/react-query'
import { schoolyearService } from '../../services/structuresService'

export const useUpdateSchoolyear = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: schoolyearService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['schoolyears'],
      })
    },
  })
}
