import { studentSevices } from "../../services/portalService"
import { useQuery } from '@tanstack/react-query'

export const useStudents =  (filters) => {
    return useQuery({
        queryKey:["students",filters],
        queryFn:() => studentSevices.list(filters),
        staleTime:5*60*1000
    })
}

