import { schoolyearService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useSchoolyears =  (filters,options = {}) => {
    return useQuery({
        queryKey:["schoolyears",filters],
        queryFn:() => schoolyearService.list(filters),
        staleTime:5*60*1000,
        ...options
    })
}

