import { assessmentService } from "../../services/assessmentsService"
import { useQuery } from '@tanstack/react-query'

export const useAssessments =  (filters) => {
    return useQuery({
        queryKey:["assessments",filters],
        queryFn:() => assessmentService.list(filters),
        staleTime:5*60*1000
    })
}

