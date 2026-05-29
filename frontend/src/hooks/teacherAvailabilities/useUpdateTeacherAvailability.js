import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teacherAvalabilityService } from '../../services/timetableService'

export const useUpdateTeacherAvailability = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: teacherAvalabilityService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teacherAvailabilities'],
      })
    },
  })
}
