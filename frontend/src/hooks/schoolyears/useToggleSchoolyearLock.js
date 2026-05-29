import { useMutation, useQueryClient } from '@tanstack/react-query'
import { schoolyearService } from '../../services/structuresService'

export const useToggleSchoolyearLock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: schoolyearService.toggleLock,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['schoolyears'],
      })
    },
  })
}
