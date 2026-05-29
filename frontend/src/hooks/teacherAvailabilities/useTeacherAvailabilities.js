import { teacherAvalabilityService } from "../../services/timetableService"
import { useQuery } from '@tanstack/react-query'

export const useTeacherAvailabilities =  (filters) => {
    return useQuery({
        queryKey:["teacherAvailabilities",filters],
        queryFn:() => teacherAvalabilityService.list(filters),
        staleTime:5*60*1000
    })
}

