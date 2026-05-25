import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mentionsSevices } from '../../services/usersService'

export const useDeleteMention = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mentionsSevices.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['mentions'],
      })
    },
  })
}