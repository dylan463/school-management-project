import { schoolyearService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useSchoolyear = (id) => {
    return useQuery({
        queryKey: ["schoolyear", id],
        queryFn: () => schoolyearService.retrieve(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    })
}
