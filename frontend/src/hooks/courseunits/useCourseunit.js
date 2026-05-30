import { courseunitService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useCourseunit = (id) => {
    return useQuery({
        queryKey: ["courseunit", id],
        queryFn: () => courseunitService.retrieve(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    })
}
