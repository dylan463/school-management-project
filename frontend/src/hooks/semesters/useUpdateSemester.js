import { useMutation, useQueryClient } from '@tanstack/react-query'
import { semesterService } from '../../services/structuresService'

export const useUpdateSemester = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: semesterService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['semesters'],
      })
    },
  })
}
