import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleService } from '../../services/timetableService'

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => scheduleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['schedules'],
      })
    },
  })
}
