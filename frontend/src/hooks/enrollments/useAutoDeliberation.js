// frontend/src/hooks/enrollments/useAutoDeliberation.js
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { enrollmentService } from '../../services/assessmentsService'

/**
 * useAutoDeliberation
 *
 * Mutation pour POST /assessments/enrollments/auto-deliberate/
 * Invalide le cache "enrollments" après succès → la liste se rafraîchit
 * automatiquement sans rechargement de page.
 *
 * Usage :
 *   const { mutate, isPending } = useAutoDeliberation()
 *   mutate(
 *     { semester: 2, formation: 1 },
 *     { onSuccess: ({ validated_count, remaining_count }) => ...,
 *       onError: (err) => ... }
 *   )
 */
export const useAutoDeliberation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (filters = {}) => enrollmentService.autoDeliberate(filters),
    onSuccess: () => {
      // Même invalidation que useChangeEnrollmentStatus :
      // force le re-fetch de toutes les queries "enrollments"
      queryClient.invalidateQueries({ queryKey: ['enrollments'] })
    },
  })
}
