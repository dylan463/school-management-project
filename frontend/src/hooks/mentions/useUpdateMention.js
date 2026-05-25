import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mentionsSevices } from '../../services/usersService'

export const useUpdateMention = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mentionsSevices.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['mentions'],
      })
    },
  })
}