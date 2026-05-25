import { headsSevices } from "../../services/usersService"
import { useQuery } from '@tanstack/react-query'

export const useHeads =  (filters) => {
    return useQuery({
        queryKey:["heads",filters],
        queryFn:() => headsSevices.list(filters),
        staleTime:5*60*1000
    })
}

