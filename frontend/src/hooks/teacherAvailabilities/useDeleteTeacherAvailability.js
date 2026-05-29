import { useMutation, useQueryClient } from '@tanstack/react-query'
import { teacherAvalabilityService } from '../../services/timetableService'

export const useDeleteTeacherAvailability = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: teacherAvalabilityService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['teacherAvailabilities'],
      })
    },
  })
}
