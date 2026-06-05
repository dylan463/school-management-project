import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleService } from '../../services/timetableService'

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: scheduleService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['schedules'],
      })
    },
  })
}
