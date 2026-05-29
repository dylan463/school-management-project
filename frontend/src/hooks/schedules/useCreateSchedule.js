import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleService } from '../../services/timetableService'

export const useCreateSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ formation, semester }) => scheduleService.create(formation, semester),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['schedules'],
      })
    },
  })
}
