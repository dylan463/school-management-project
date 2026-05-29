import { useMutation, useQueryClient } from '@tanstack/react-query'
import { coursemoduleService } from '../../services/structuresService'

export const useCreateCoursemodule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: coursemoduleService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['coursemodules'],
      })
    },
  })
}
