import { coursemoduleService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useCoursemodules =  (filters) => {
    return useQuery({
        queryKey:["coursemodules",filters],
        queryFn:() => coursemoduleService.list(filters),
        staleTime:5*60*1000
    })
}

