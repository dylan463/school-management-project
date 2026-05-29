import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formationService } from '../../services/structuresService'

export const useUpdateFormation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: formationService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['formations'],
      })
    },
  })
}
