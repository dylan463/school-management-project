import { mentionsSevices } from "../../services/usersService"
import { useQuery } from '@tanstack/react-query'

export const useMentions =  (filters) => {
    return useQuery({
        queryKey:["mentions",filters],
        queryFn:() => mentionsSevices.list(filters),
        staleTime:5*60*1000
    })
}

