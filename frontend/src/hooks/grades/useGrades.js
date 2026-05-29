import { gradeService } from "../../services/assessmentsService"
import { useQuery } from '@tanstack/react-query'

export const useGrades =  (filters) => {
    return useQuery({
        queryKey:["grades",filters],
        queryFn:() => gradeService.list(filters),
        staleTime:5*60*1000
    })
}

