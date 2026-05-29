import { scheduleEntryService } from "../../services/timetableService"
import { useQuery } from '@tanstack/react-query'

export const useScheduleEntries =  (filters) => {
    return useQuery({
        queryKey:["scheduleEntries",filters],
        queryFn:() => scheduleEntryService.list(filters),
        staleTime:5*60*1000
    })
}

