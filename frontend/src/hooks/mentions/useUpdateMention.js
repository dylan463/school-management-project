import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mentionService } from '../../services/structuresService'

export const useUpdateMention = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mentionService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['mentions'],
      })
    },
  })
}