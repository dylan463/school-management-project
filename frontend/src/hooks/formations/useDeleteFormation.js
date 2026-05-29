import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formationService } from '../../services/structuresService'

export const useDeleteFormation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: formationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['formations'],
      })
    },
  })
}
