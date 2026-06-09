// frontend/src/components/Timetable/TimetableTable.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Composant de rendu pur.
// Adapté au modèle réel ScheduleEntry du backend Django :
//   { id, day, start_time, end_time, classroom, course_module: { name, teacher: { first_name, last_name } } }
//
// Les jours arrivent en anglais (MONDAY, TUESDAY...) depuis l'API.
// Ce composant les traduit et les groupe pour l'affichage.
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_CONFIG = [
  { value: "MONDAY",    label: "LUNDI"    },
  { value: "TUESDAY",   label: "MARDI"    },
  { value: "WEDNESDAY", label: "MERCREDI" },
  { value: "THURSDAY",  label: "JEUDI"    },
  { value: "FRIDAY",    label: "VENDREDI" },
  { value: "SATURDAY",  label: "SAMEDI"   },
]

// Formate "08:30:00" → "08h30"
function formatTime(timeStr) {
  if (!timeStr) return ""
  const [h, m] = timeStr.split(":")
  return `${h}h${m}`
}

// Regroupe les entries par jour dans l'ordre défini
function groupByDay(entries) {
  const map = Object.fromEntries(DAYS_CONFIG.map((d) => [d.value, []]))
  entries.forEach((e) => { if (map[e.day] !== undefined) map[e.day].push(e) })
  return DAYS_CONFIG
    .map(({ value, label }) => ({ day: value, label, entries: map[value] }))
    .filter(({ entries }) => entries.length > 0)
}

// Récupère le nom complet de l'enseignant depuis course_module
function getTeacher(entry) {
  const teacher = entry.course_module?.teacher
  if (!teacher) return "—"
  const full = [teacher.first_name, teacher.last_name].filter(Boolean).join(" ")
  return full || teacher.username || "—"
}

// Récupère le nom du module
function getMatiere(entry) {
  return entry.course_module?.text ?? entry.course_module?.code ?? "—"
}

/**
 * TimetableTable
 *
 * Props :
 *  @param {Array} entries — tableau de ScheduleEntry bruts venant de l'API
 *                           [{id, day, start_time, end_time, classroom, course_module:{...}}]
 */
export default function TimetableTable({ entries = [] }) {
  const groups = groupByDay(entries)

  if (groups.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        Aucun cours enregistré pour cet emploi du temps.
      </div>
    )
  }

  return (
    <table className="w-full border-collapse text-sm">

      {/* ── En-têtes ── */}
      <thead>
        <tr className="bg-gray-800 text-white">
          <th className="border border-gray-600 px-2 py-2 text-center text-xs tracking-widest uppercase font-semibold"
              style={{ width: "44px" }}>
            Jour
          </th>
          <th className="border border-gray-600 px-3 py-2 text-center text-xs tracking-widest uppercase font-semibold"
              style={{ width: "110px" }}>
            Heures
          </th>
          <th className="border border-gray-600 px-3 py-2 text-center text-xs tracking-widest uppercase font-semibold">
            Matières
          </th>
          <th className="border border-gray-600 px-3 py-2 text-center text-xs tracking-widest uppercase font-semibold"
              style={{ width: "200px" }}>
            Enseignants
          </th>
        </tr>
      </thead>

      {/* ── Corps ── */}
      <tbody>
        {groups.map(({ day, label, entries: lignes }) =>
          lignes.map((entry, idx) => (
            <tr key={entry.id ?? `${day}-${idx}`}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>

              {/* Cellule JOUR — fusionnée sur toutes les lignes du jour */}
              {idx === 0 && (
                <td rowSpan={lignes.length}
                    className="border border-gray-300 text-center align-middle bg-gray-100 font-bold text-gray-700 text-xs p-0"
                    style={{ width: "44px" }}>
                  <div style={{
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.15em",
                    padding: "10px 0",
                  }}>
                    {label}
                  </div>
                </td>
              )}

              {/* Heures */}
              <td className="border border-gray-300 px-3 py-2.5 text-center align-middle text-gray-700 font-medium tabular-nums whitespace-nowrap">
                <span className="block text-xs">{formatTime(entry.start_time)}</span>
                <span className="block text-gray-400 text-xs leading-none my-0.5">—</span>
                <span className="block text-xs">{formatTime(entry.end_time)}</span>
              </td>

              {/* Matière */}
              <td className="border border-gray-300 px-4 py-2.5 align-middle text-gray-900 font-medium">
                {getMatiere(entry)}
              </td>

              {/* Enseignant */}
              <td className="border border-gray-300 px-3 py-2.5 align-middle text-gray-600 text-xs">
                {getTeacher(entry)}
              </td>

            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
