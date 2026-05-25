import { useMutation, useQueryClient } from '@tanstack/react-query'
import { mentionsSevices } from '../../services/usersService'

export const useCreateMention = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: mentionsSevices.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['mentions'],
      })
    },
  })
}