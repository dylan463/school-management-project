import { useQuery } from '@tanstack/react-query'
import { scheduleEntryService } from '../../services/timetableService'

export const useScheduleEntries = (filters = {}) => {
  return useQuery({
    queryKey: ['schedule-entries', filters],
    queryFn: () => scheduleEntryService.list(filters),
    staleTime: 5 * 60 * 1000,
  })
}
