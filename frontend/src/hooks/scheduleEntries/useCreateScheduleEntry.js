import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleEntryService } from '../../services/timetableService'

export const useCreateScheduleEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: scheduleEntryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scheduleEntries'],
      })
    },
  })
}
