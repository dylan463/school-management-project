import { semesterService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useSemesters =  (filters) => {
    return useQuery({
        queryKey:["semesters",filters],
        queryFn:() => semesterService.list(filters),
        staleTime:5*60*1000
    })
}

