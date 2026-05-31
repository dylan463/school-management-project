import { useQuery } from '@tanstack/react-query'
import { importJobServices } from '../../services/portalService'

export const useImportJobs = (filters = {}) => {
  return useQuery({
    queryKey: ['importJobs', filters],
    queryFn: () => importJobServices.list(filters),
  })
}
