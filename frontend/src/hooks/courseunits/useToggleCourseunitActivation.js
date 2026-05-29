import { useMutation, useQueryClient } from '@tanstack/react-query'
import { courseunitService } from '../../services/structuresService'

export const useToggleCourseunitActivation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: courseunitService.toggleActivation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['courseunits'],
      })
    },
  })
}
