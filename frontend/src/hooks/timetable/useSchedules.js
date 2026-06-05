import { useQuery } from '@tanstack/react-query'
import { scheduleService } from '../../services/timetableService'

export const useSchedules = (filters = {}) => {
  return useQuery({
    queryKey: ['schedules', filters],
    queryFn: () => scheduleService.list(filters),
    staleTime: 5 * 60 * 1000,
  })
}
