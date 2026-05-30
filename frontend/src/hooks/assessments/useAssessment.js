import { assessmentService } from "../../services/assessmentsService"
import { useQuery } from '@tanstack/react-query'

export const useAssessment = (id) => {
    return useQuery({
        queryKey: ["assessment", id],
        queryFn: () => assessmentService.retrieve(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    })
}
