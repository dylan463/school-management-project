import { useMutation, useQueryClient } from '@tanstack/react-query'
import { courseunitService } from '../../services/structuresService'

export const useUpdateCourseunit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: courseunitService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['courseunits'],
      })
    },
  })
}
