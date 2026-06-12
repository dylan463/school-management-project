import { formationService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useFormations =  (filters, options = {}) => {
    const defaultOptions = {
        enabled: true,
        staleTime: 5 * 60 * 1000,
    }

    return useQuery({
        queryKey:["formations",filters],
        queryFn:() => formationService.list(filters),
        ...defaultOptions,
        ...options,
    })
}

