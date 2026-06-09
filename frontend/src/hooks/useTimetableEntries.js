// frontend/src/hooks/timetable/useTimetableEntries.js
// ─────────────────────────────────────────────────────────────────────────────
// Hook React Query dédié à l'affichage de l'emploi du temps.
// Suit exactement la même convention que useScheduleEntries existant,
// mais expose les données déjà aplaties (results ou tableau direct).
//
// Endpoint : GET /api/timetable/schedule-entries/?schedule=<id>
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery } from "@tanstack/react-query"
import { useScheduleEntries } from "./timetable/useScheduleEntries"

/**
 * useTimetableEntries
 *
 * @param {number|string} scheduleId — ID du Schedule à afficher (obligatoire)
 * @param {Object}        options    — options React Query supplémentaires (enabled, etc.)
 *
 * @returns {{ entries, isLoading, isError, error, refetch }}
 *
 * Exemple :
 *   const { entries, isLoading } = useTimetableEntries(schedule.id)
 */
export function useTimetableEntries(scheduleId, options = {}) {
  const query = useScheduleEntries({ schedule: scheduleId, no_pagination:true}, options )
  
  // Le backend peut retourner { results: [...] } (paginé) ou un tableau direct
  const raw = query.data
  const entries = Array.isArray(raw) ? raw : (raw?.results ?? [])

  return {
    entries,
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error,
    refetch:   query.refetch,
  }
}
