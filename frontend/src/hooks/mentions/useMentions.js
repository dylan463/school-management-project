import { mentionService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useMentions = (filters, enable = true, staleTime = 5 * 60 * 1000) => {
    return useQuery({
        queryKey: ["mentions", filters],
        queryFn: () => mentionService.list(filters),
        staleTime: staleTime,
        enabled: enable
    })
}

