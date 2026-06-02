import { teacherSevices } from "../../services/portalService"
import { useQuery } from '@tanstack/react-query'

export const useTeachers =  (filters) => {
    return useQuery({
        queryKey:["teachers",filters],
        queryFn:() => teacherSevices.list(filters),
        staleTime:5*60*1000
    })
}

