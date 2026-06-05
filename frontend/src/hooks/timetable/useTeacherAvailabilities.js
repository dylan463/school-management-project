import { useQuery } from '@tanstack/react-query'
import { teacherAvalabilityService } from '../../services/timetableService'

export const useTeacherAvailabilities = (filters = {}) => {
  return useQuery({
    queryKey: ['teacher-availabilities', filters],
    queryFn: () => teacherAvalabilityService.list(filters),
    staleTime: 5 * 60 * 1000,
  })
}
