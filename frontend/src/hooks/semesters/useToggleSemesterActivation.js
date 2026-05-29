import { useMutation, useQueryClient } from '@tanstack/react-query'
import { semesterService } from '../../services/structuresService'

export const useToggleSemesterActivation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: semesterService.toggleActivation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['semesters'],
      })
    },
  })
}
