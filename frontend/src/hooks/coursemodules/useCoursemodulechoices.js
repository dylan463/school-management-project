import { coursemoduleService } from "../../services/structuresService"
import { useQuery } from '@tanstack/react-query'
import { ROLES } from "../../utils/constants"

export const useCoursemodulechoices = (filters = {}, role = "") => {
    return useQuery({
        queryKey: ["coursemodulechoices", filters],
        queryFn: () => coursemoduleService.listChoice(filters),
        staleTime: 5 * 60 * 1000,
        enabled: role == ROLES.TEACHER
    })
}

