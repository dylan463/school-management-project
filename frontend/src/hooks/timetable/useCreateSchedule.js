import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleService } from '../../services/timetableService'

export const useCreateSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => scheduleService.create(data.formation, data.semester),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['schedules'],
      })
    },
  })
}
