// frontend/src/components/dashboard/StudentCalendar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Calendrier mensuel compact.
// Marque les jours qui correspondent à des examens (upcoming_exams_dates[])
// ou à des notifications récentes (highlighted_days[]).
// Sans données, affiche le mois courant avec jours neutres.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

/**
 * Props :
 *  @param {string[]} [examDates]      — tableau de dates ISO "YYYY-MM-DD" → cercle rouge plein
 *  @param {string[]} [notifDates]     — tableau de dates ISO "YYYY-MM-DD" → bordure rouge
 */
export default function StudentCalendar({ examDates = [], notifDates = [] }) {
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed

  const today = now.getDate()
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  // Nombre de jours dans le mois
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Décalage : 1er du mois = quel jour (0=Dim → converti en base Lundi)
  const firstDow = new Date(year, month, 1).getDay()       // 0=Sun
  const offset   = (firstDow === 0 ? 6 : firstDow - 1)    // 0=Mon

  // Normalisateurs de dates pour comparaison
  const toISO = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const isExamDay  = (d) => examDates.includes(toISO(d))
  const isNotifDay = (d) => notifDates.includes(toISO(d))

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-800">Calendrier</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">
            {MONTHS_FR[month]} {year}
          </span>
          <div className="flex gap-1">
            <button
              onClick={prevMonth}
              className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
              aria-label="Mois précédent"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M7 2L3 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={nextMonth}
              className="w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
              aria-label="Mois suivant"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M5 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {/* Cellules vides (décalage) */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}

        {/* Jours du mois */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const exam  = isExamDay(day)
          const notif = isNotifDay(day)
          const isToday = isCurrentMonth && day === today

          return (
            <div
              key={day}
              title={exam ? 'Examen' : notif ? 'Événement' : undefined}
              className={`
                mx-auto w-7 h-7 flex items-center justify-center rounded-full
                text-[11px] font-medium cursor-default select-none transition-colors
                ${exam
                  ? 'bg-red-500 text-white font-bold'
                  : notif
                  ? 'border-2 border-red-500 text-red-600 font-semibold'
                  : isToday
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:bg-slate-50'
                }
              `}
            >
              {day}
            </div>
          )
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-[10px] text-slate-400">Examen</span>
        </div>
        {isCurrentMonth && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-800" />
            <span className="text-[10px] text-slate-400">Aujourd'hui</span>
          </div>
        )}
      </div>
    </div>
  )
}
