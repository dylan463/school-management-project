import { mentionService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useMentions =  (filters) => {
    return useQuery({
        queryKey:["mentions",filters],
        queryFn:() => mentionService.list(filters),
        staleTime:5*60*1000
    })
}

