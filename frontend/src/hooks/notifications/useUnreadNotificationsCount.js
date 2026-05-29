import notificationsService from "../../services/notificationsService"
import { useQuery } from '@tanstack/react-query'

export const useUnreadNotificationsCount =  () => {
    return useQuery({
        queryKey:["notificationsUnreadCount"],
        queryFn:() => notificationsService.unreadCount(),
        staleTime:5*60*1000
    })
}

