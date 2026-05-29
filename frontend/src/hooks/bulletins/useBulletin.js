import { BulletinService } from "../../services/assessmentsService"
import { useQuery } from '@tanstack/react-query'

export const useBulletin =  (id) => {
    return useQuery({
        queryKey:["bulletin",id],
        queryFn:() => BulletinService.retrive(id),
        staleTime:5*60*1000,
        enabled: !!id
    })
}

