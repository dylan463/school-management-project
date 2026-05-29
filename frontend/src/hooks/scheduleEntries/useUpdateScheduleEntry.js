import { useMutation, useQueryClient } from '@tanstack/react-query'
import { scheduleEntryService } from '../../services/timetableService'

export const useUpdateScheduleEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: scheduleEntryService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['scheduleEntries'],
      })
    },
  })
}
