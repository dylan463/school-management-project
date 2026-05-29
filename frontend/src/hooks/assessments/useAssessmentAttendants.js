import { assessmentService } from "../../services/assessmentsService"
import { useQuery } from '@tanstack/react-query'

export const useAssessmentAttendants =  (filters) => {
    return useQuery({
        queryKey:["assessmentAttendants",filters],
        queryFn:() => assessmentService.attendants(filters),
        staleTime:5*60*1000
    })
}

