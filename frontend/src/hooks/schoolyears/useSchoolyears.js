import { schoolyearService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useSchoolyears =  (filters, options = {}) => {
    const defaultOptions = {
        enabled: true,
        staleTime: 5 * 60 * 1000,
    }

    return useQuery({
        queryKey:["schoolyears",filters],
        queryFn:() => schoolyearService.list(filters),
        ...defaultOptions,
        ...options,
    })
}

