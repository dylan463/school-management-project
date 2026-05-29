import { courseunitService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useCourseunits =  (filters) => {
    return useQuery({
        queryKey:["courseunits",filters],
        queryFn:() => courseunitService.list(filters),
        staleTime:5*60*1000
    })
}

