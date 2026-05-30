import { coursemoduleService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useCoursemodule = (id) => {
    return useQuery({
        queryKey: ["coursemodule", id],
        queryFn: () => coursemoduleService.retrieve(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    })
}
