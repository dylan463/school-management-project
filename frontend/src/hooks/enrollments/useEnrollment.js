import { enrollmentService } from "../../services/assessmentsService"
import { useQuery } from '@tanstack/react-query'

export const useEnrollment = (id) => {
    return useQuery({
        queryKey: ["enrollment", id],
        queryFn: () => enrollmentService.retrieve(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    })
}
