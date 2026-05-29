import { useMutation, useQueryClient } from '@tanstack/react-query'
import { coursemoduleService } from '../../services/structuresService'

export const useToggleCoursemoduleActivation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: coursemoduleService.toggleActivation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['coursemodules'],
      })
    },
  })
}
