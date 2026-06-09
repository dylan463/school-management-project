import { mentionService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useMentions = (filters, options = {}) => {
    return useQuery({
        queryKey: ["mentions", filters],
        queryFn: () => mentionService.list(filters),
        ...options
    })
}

