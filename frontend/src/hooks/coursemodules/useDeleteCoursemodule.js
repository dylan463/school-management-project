import { useMutation, useQueryClient } from '@tanstack/react-query'
import { coursemoduleService } from '../../services/structuresService'

export const useDeleteCoursemodule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: coursemoduleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['coursemodules'],
      })
    },
  })
}
