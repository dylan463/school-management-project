import Card from '../../components/ui/Card'

const DAYS  = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
const SLOTS = ['07h30', '10h00', '13h30', '16h00']

const COLORS = {
  blue:   'bg-blue-50 text-blue-800 border-blue-200',
  green:  'bg-green-50 text-green-800 border-green-200',
  amber:  'bg-amber-50 text-amber-800 border-amber-200',
  purple: 'bg-purple-50 text-purple-800 border-purple-200',
}

const PLANNING = {
  'Lundi-07h30':    { label: 'Électronique', type: 'Cours magistral', room: 'Salle B12', students: 87, color: 'blue'   },
  'Mardi-10h00':    { label: 'Électronique', type: 'TP Laboratoire',  room: 'Labo 1',    students: 43, color: 'blue'   },
  'Jeudi-13h30':    { label: 'Antennes',     type: 'Cours magistral', room: 'Amphi A',   students: 52, color: 'purple' },
  'Vendredi-07h30': { label: 'Antennes',     type: 'TD',              room: 'Salle A4',  students: 26, color: 'purple' },
  'Mercredi-10h00': { label: 'Électronique', type: 'TD',              room: 'Salle C3',  students: 44, color: 'blue'   },
}

const WEEK_SUMMARY = [
  { day: 'Lundi',    time: '07h30 – 09h30', label: 'Électronique — Cours',  room: 'Salle B12', students: 87 },
  { day: 'Mardi',    time: '10h00 – 13h00', label: 'Électronique — TP',     room: 'Labo 1',    students: 43 },
  { day: 'Mercredi', time: '10h00 – 12h00', label: 'Électronique — TD',     room: 'Salle C3',  students: 44 },
  { day: 'Jeudi',    time: '13h30 – 15h30', label: 'Antennes — Cours',      room: 'Amphi A',   students: 52 },
  { day: 'Vendredi', time: '07h30 – 09h30', label: 'Antennes — TD',         room: 'Salle A4',  students: 26 },
]

export default function PlanningPage() {
  return (
    <div className="fade-in space-y-4">
      <div className="mb-1">
        <h2 className="text-base font-semibold text-slate-800">Mon planning</h2>
        <p className="text-xs text-slate-400 mt-0.5">Semaine du 7 au 11 avril 2026 — Semestre 3</p>
      </div>

      {/* Weekly grid */}
      <Card title="Vue hebdomadaire">
        <div className="overflow-x-auto">
          <div className="grid gap-1.5 min-w-[600px]" style={{ gridTemplateColumns: '64px repeat(5, 1fr)' }}>
            <div />
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-600 py-2 bg-slate-50 rounded-lg">{d}</div>
            ))}
            {SLOTS.map(slot => (
              <>
                <div key={`t-${slot}`} className="text-[11px] text-slate-400 pt-2.5">{slot}</div>
                {DAYS.map(day => {
                  const key  = `${day}-${slot}`
                  const cell = PLANNING[key]
                  return cell ? (
                    <div key={key} className={`rounded-xl p-2.5 border text-[11px] min-h-[58px] ${COLORS[cell.color]}`}>
                      <p className="font-semibold leading-tight">{cell.label}</p>
                      <p className="opacity-75 text-[10px] mt-0.5">{cell.type}</p>
                      <p className="opacity-60 text-[10px]">{cell.room} · {cell.students} ét.</p>
                    </div>
                  ) : (
                    <div key={key} className="rounded-xl bg-slate-50 min-h-[58px] border border-slate-100" />
                  )
                })}
              </>
            ))}
          </div>
        </div>
      </Card>

      {/* Summary list */}
      <Card title="Récapitulatif de la semaine">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="text-left pb-3 font-medium">Jour</th>
                <th className="text-left pb-3 font-medium">Horaire</th>
                <th className="text-left pb-3 font-medium">Cours</th>
                <th className="text-left pb-3 font-medium">Salle</th>
                <th className="text-center pb-3 font-medium">Étudiants</th>
              </tr>
            </thead>
            <tbody>
              {WEEK_SUMMARY.map((s, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 font-medium text-slate-800">{s.day}</td>
                  <td className="py-3 text-slate-500 font-mono text-[11px]">{s.time}</td>
                  <td className="py-3 text-slate-700">{s.label}</td>
                  <td className="py-3 text-slate-500">{s.room}</td>
                  <td className="py-3 text-center">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-medium">
                      {s.students}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-50 flex gap-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-800">10h</p>
            <p className="text-[10px] text-slate-400">Total heures / semaine</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-800">3</p>
            <p className="text-[10px] text-slate-400">Cours différents</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-800">252</p>
            <p className="text-[10px] text-slate-400">Étudiants au total</p>
          </div>
        </div>
      </Card>
    </div>
  )
}