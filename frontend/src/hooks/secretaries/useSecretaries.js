import { secretarySevices } from "../../services/portalService"
import { useQuery } from '@tanstack/react-query'

export const useSecretaries =  (filters) => {
    return useQuery({
        queryKey:["secretaries",filters],
        queryFn:() => secretarySevices.list(filters),
        staleTime:5*60*1000
    })
}

