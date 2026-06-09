// frontend/src/components/Timetable/TimetableWidget.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Composant principal à intégrer dans vos pages.
// Utilise React Query (déjà configuré dans votre App.jsx via QueryClientProvider).
// Lit les données depuis /api/timetable/schedule-entries/?schedule=<id>
// ─────────────────────────────────────────────────────────────────────────────

import { useTimetableEntries } from "../../hooks/useTimetableEntries"
import TimetableTable from "./TimetableTable"

/**
 * TimetableWidget
 *
 * Props :
 *  @param {number|string} scheduleId   — ID du Schedule (obligatoire)
 *  @param {string}        [className]  — classes Tailwind supplémentaires
 *  @param {boolean}       [showFooter] — afficher le pied de page (défaut: true)
 *
 * Exemple d'intégration dans ScheduleDetailsPanel ou toute autre page :
 *
 *   import TimetableWidget from "../components/Timetable/TimetableWidget"
 *
 *   <TimetableWidget scheduleId={schedule.id} />
 *   <TimetableWidget scheduleId={schedule.id} showFooter={false} className="mt-4" />
 */
export default function TimetableWidget({
  scheduleId,
  className  = "",
  showFooter = true,
}) {
  const { entries, isLoading, isError, error, refetch } = useTimetableEntries(scheduleId)

  return (
    <div
      className={`bg-white w-full print:shadow-none ${className}`}
      style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
    >

      {/* ── Chargement ── */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-3">
          <svg className="animate-spin h-5 w-5"
               xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Chargement de l'emploi du temps…
        </div>
      )}

      {/* ── Erreur ── */}
      {!isLoading && isError && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-red-500 text-sm font-medium">
            Impossible de charger les données.
          </p>
          <p className="text-gray-400 text-xs">
            {error?.message ?? "Erreur inconnue"}
          </p>
          <button
            onClick={refetch}
            className="mt-2 px-4 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* ── Données chargées ── */}
      {!isLoading && !isError && (
        <>
          <div className="px-6 py-4 print:px-4">
            <TimetableTable entries={entries} />
          </div>

          {showFooter && (
            <footer className="px-6 pb-5 pt-2 flex justify-between items-end text-xs text-gray-400 border-t border-gray-200 print:pb-3">
              <span>
                Document généré le{" "}
                {new Date().toLocaleDateString("fr-FR", {
                  day: "2-digit", month: "long", year: "numeric",
                })}
              </span>
              <span className="italic">
                Service de la Scolarité — Université d'Antananarivo
              </span>
            </footer>
          )}
        </>
      )}

      {/* ── Styles impression ── */}
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm 10mm; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}
