import { formationService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useFormation = (id) => {
    return useQuery({
        queryKey: ["formation", id],
        queryFn: () => formationService.retrieve(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    })
}
