import { useMutation, useQueryClient } from '@tanstack/react-query'
import { semesterService } from '../../services/structuresService'

export const useCreateSemester = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: semesterService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['semesters'],
      })
    },
  })
}
