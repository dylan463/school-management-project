import authService from "../../services/authService"
import { useQuery } from '@tanstack/react-query'

export const useMe =  (enabled = true) => {
    return useQuery({
        queryKey:["me"],
        queryFn:() => authService.me(),
        staleTime:5*60*1000,
        enabled: !!enabled
    })
}

