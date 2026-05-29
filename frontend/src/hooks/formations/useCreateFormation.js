import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formationService } from '../../services/structuresService'

export const useCreateFormation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: formationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['formations'],
      })
    },
  })
}
