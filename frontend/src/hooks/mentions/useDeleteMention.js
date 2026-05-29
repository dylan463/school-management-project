import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mentionService } from '../../services/structuresService'

export const useDeleteMention = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mentionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['mentions'],
      })
    },
  })
}