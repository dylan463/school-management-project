import { semesterService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'

export const useSemester = (id) => {
    return useQuery({
        queryKey: ["semester", id],
        queryFn: () => semesterService.retrieve(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    })
}
