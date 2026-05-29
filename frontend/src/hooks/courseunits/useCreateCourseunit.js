import { useMutation, useQueryClient } from '@tanstack/react-query'
import { courseunitService } from '../../services/structuresService'

export const useCreateCourseunit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: courseunitService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['courseunits'],
      })
    },
  })
}
