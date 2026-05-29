import { useMutation, useQueryClient } from '@tanstack/react-query'
import { coursemoduleService } from '../../services/structuresService'

export const useUpdateCoursemodule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: coursemoduleService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['coursemodules'],
      })
    },
  })
}
