import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleEntryService } from '../../services/timetableService'

export const useDeleteScheduleEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: scheduleEntryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['schedule-entries'],
      })
    },
  })
}
