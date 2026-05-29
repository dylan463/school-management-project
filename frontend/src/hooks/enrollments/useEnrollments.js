import { enrollmentService } from "../../services/assessmentsService"
import { useQuery } from '@tanstack/react-query'

export const useEnrollments =  (filters) => {
    return useQuery({
        queryKey:["enrollments",filters],
        queryFn:() => enrollmentService.list(filters),
        staleTime:5*60*1000
    })
}

