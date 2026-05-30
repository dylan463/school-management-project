import { teacherSevices } from "../../services/portalService"
import { useQuery } from '@tanstack/react-query'

export const useTeacher = (id) => {
    return useQuery({
        queryKey: ["teacher", id],
        queryFn: () => teacherSevices.retrieve(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    })
}
