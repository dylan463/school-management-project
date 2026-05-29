import { useMutation, useQueryClient } from '@tanstack/react-query'
import { courseunitService } from '../../services/structuresService'

export const useDeleteCourseunit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: courseunitService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['courseunits'],
      })
    },
  })
}
