import { useMutation, useQueryClient } from '@tanstack/react-query'
import { semesterService } from '../../services/structuresService'

export const useDeleteSemester = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: semesterService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['semesters'],
      })
    },
  })
}
