import { teacherSevices } from "../../services/portalService"
import { useQuery } from '@tanstack/react-query'

export const useHeads =  (filters) => {
    return useQuery({
        queryKey:["heads",filters],
        queryFn:() => teacherSevices.list(filters),
        staleTime:5*60*1000
    })
}

