import { formationService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useFormations =  (filters, enabled, staleTime = 5*60*1000) => {
    return useQuery({
        queryKey:["formations",filters],
        queryFn:() => formationService.list(filters),
        staleTime: staleTime,
        enabled: enabled
    })
}

