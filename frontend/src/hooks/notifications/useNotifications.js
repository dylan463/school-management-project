import notificationsService from "../../services/notificationsService"
import { useQuery } from '@tanstack/react-query'

export const useNotifications =  () => {
    return useQuery({
        queryKey:["notifications"],
        queryFn:() => notificationsService.list(),
        staleTime:5*60*1000
    })
}

