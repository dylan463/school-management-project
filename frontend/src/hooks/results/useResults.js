import { resultService } from "../../services/assessmentsService"
import { useQuery } from '@tanstack/react-query'

export const useResults =  (filters) => {
    return useQuery({
        queryKey:["results",filters],
        queryFn:() => resultService.list(filters),
        staleTime:5*60*1000
    })
}

