import { debtService } from "../../services/assessmentsService"
import { useQuery } from '@tanstack/react-query'

export const useDebts = (filters) => {
    return useQuery({
        queryKey: ["debts", filters],
        queryFn: () => debtService.list(filters),
        staleTime: 5 * 60 * 1000,
        enabled: !!filters?.enrollment
    })
}

