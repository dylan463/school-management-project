import { studentSevices } from "../../services/portalService"
import { useQuery } from '@tanstack/react-query'

export const useStudent = (id) => {
    return useQuery({
        queryKey: ["student", id],
        queryFn: () => studentSevices.retrieve(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    })
}
