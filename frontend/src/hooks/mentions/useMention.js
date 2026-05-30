import { mentionService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useMention = (id) => {
    return useQuery({
        queryKey: ["mention", id],
        queryFn: () => mentionService.retrieve(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    })
}
