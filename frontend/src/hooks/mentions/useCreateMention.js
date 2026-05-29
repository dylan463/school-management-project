import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mentionService } from '../../services/structuresService'

export const useCreateMention = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mentionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['mentions'],
      })
    },
  })
}