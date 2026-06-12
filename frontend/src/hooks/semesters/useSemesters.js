import { semesterService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useSemesters =  (filters, options = {}) => {
    const defaultOptions = {
        enabled: true,
        staleTime: 5 * 60 * 1000,
    }

    return useQuery({
        queryKey:["semesters",filters],
        queryFn:() => semesterService.list(filters),
        ...defaultOptions,
        ...options,
    })
}

