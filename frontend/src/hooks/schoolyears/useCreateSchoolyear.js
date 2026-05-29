import { useMutation, useQueryClient } from '@tanstack/react-query'
import { schoolyearService } from '../../services/structuresService'

export const useCreateSchoolyear = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: schoolyearService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['schoolyears'],
      })
    },
  })
}
