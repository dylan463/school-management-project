import { useQuery } from '@tanstack/react-query'
import { importJobServices } from '../../services/portalService'

export const useImportJob = (id, options = {}) => {
  return useQuery({
    queryKey: ['importJobs', id],
    queryFn: () => importJobServices.retrieve(id),
    enabled: !!id,
    ...options,
  })
}
