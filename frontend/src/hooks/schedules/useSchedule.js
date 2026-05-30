import { scheduleService } from "../../services/timetableService"
import { useQuery } from '@tanstack/react-query'

export const useSchedule = (id) => {
    return useQuery({
        queryKey: ["schedule", id],
        queryFn: () => scheduleService.retrieve(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    })
}
