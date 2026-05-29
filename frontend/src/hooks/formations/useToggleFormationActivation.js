import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formationService } from '../../services/structuresService'

export const useToggleFormationActivation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: formationService.toggleActivation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['formations'],
      })
    },
  })
}
