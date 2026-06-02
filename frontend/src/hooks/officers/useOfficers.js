import { officerSevices } from "../../services/portalService"
import { useQuery } from '@tanstack/react-query'

export const useOfficers =  (filters) => {
    return useQuery({
        queryKey:["officers",filters],
        queryFn:() => officerSevices.list(filters),
        staleTime:5*60*1000
    })
}

