import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teacherAvalabilityService } from '../../services/timetableService'

export const useCreateTeacherAvailability = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: teacherAvalabilityService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teacher-availabilities'],
      })
    },
  })
}
