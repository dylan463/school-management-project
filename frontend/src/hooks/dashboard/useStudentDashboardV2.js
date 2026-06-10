// frontend/src/hooks/dashboard/useStudentDashboardV2.js
// ─────────────────────────────────────────────────────────────────────────────
// Version enrichie de useStudentDashboard.
// Ajoute le calcul des dates d'examens à venir (examDates[])
// issues de weekly_schedule, pour alimenter le calendrier.
//
// Endpoint : GET /portal/dashboard/student/
// Réponse  : { active_modules_count, upcoming_exams, recent_grades[], weekly_schedule[] }
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../../services/dashboardService'

export const useStudentDashboardV2 = () => {
  const query = useQuery({
    queryKey: ['student-dashboard'],    // même clé → partage le cache avec l'existant
    queryFn: () => dashboardService.getStudentDashboard(),
    staleTime: 5 * 60 * 1000,
  })

  const data = query.data ?? {}

  // Extraire les dates d'examen depuis recent_grades (champ "date": "YYYY-MM-DD")
  const examDates = data.examDates ?? []

  return {
    ...query,
    modules: data.modules ?? 0,
    semestres:       data.semesters       ?? 0,
    examDates,
  }
}
