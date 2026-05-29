import { gridService } from "../../services/assessmentsService"
import { useQuery } from '@tanstack/react-query'

export const useGradeGrid =  (filters) => {
    return useQuery({
        queryKey:["gradeGrid",filters],
        queryFn:() => gridService.retrieve(filters),
        staleTime:5*60*1000
    })
}

