import Card from '../../components/ui/Card'

const DAYS  = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
const SLOTS = ['07h30', '10h00', '13h30', '16h00']

const COLORS = {
  blue:   'bg-blue-50 text-blue-800 border-blue-200',
  green:  'bg-green-50 text-green-800 border-green-200',
  amber:  'bg-amber-50 text-amber-800 border-amber-200',
  purple: 'bg-purple-50 text-purple-800 border-purple-200',
}

const EDT = {
  'Lundi-07h30':    { label: 'Électronique', type: 'Cours', room: 'Salle B12', prof: 'Prof. Razafindrakoto', color: 'blue'   },
  'Mercredi-07h30': { label: 'Réseaux',      type: 'TP',    room: 'Labo 2',    prof: 'Prof. Andriamanjato', color: 'green'  },
  'Vendredi-07h30': { label: 'Signal',        type: 'Cours', room: 'Salle A4',  prof: 'Prof. Randriamanantena', color: 'purple' },
  'Mardi-10h00':    { label: 'Maths App.',    type: 'TD',    room: 'Amphi C',   prof: 'Prof. Ramaroson',     color: 'amber'  },
  'Jeudi-10h00':    { label: 'Électronique',  type: 'TP',    room: 'Labo 1',    prof: 'Prof. Razafindrakoto', color: 'blue'   },
  'Lundi-13h30':    { label: 'Réseaux',       type: 'Cours', room: 'Salle B12', prof: 'Prof. Andriamanjato', color: 'green'  },
  'Jeudi-13h30':    { label: 'Signal',         type: 'TD',   room: 'Amphi A',   prof: 'Prof. Randriamanantena', color: 'purple' },
  'Vendredi-13h30': { label: 'Maths App.',    type: 'Cours', room: 'Salle A4',  prof: 'Prof. Ramaroson',     color: 'amber'  },
}

export default function EmploiDuTempsPage() {
  return (
    <div className="fade-in space-y-4">
      <div className="mb-1">
        <h2 className="text-base font-semibold text-slate-800">Emploi du temps — Semestre 3</h2>
        <p className="text-xs text-slate-400 mt-0.5">Semaine du 7 au 11 avril 2026</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <div className="grid gap-1.5 min-w-[600px]" style={{ gridTemplateColumns: '64px repeat(5, 1fr)' }}>
            {/* Header */}
            <div />
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-600 py-2 bg-slate-50 rounded-lg">{d}</div>
            ))}

            {/* Rows */}
            {SLOTS.map(slot => (
              <>
                <div key={`t-${slot}`} className="text-xs text-slate-400 pt-2 flex-shrink-0">{slot}</div>
                {DAYS.map(day => {
                  const key  = `${day}-${slot}`
                  const cell = EDT[key]
                  return cell ? (
                    <div key={key} className={`rounded-xl p-2.5 border text-xs min-h-[56px] ${COLORS[cell.color]}`}>
                      <p className="font-semibold leading-tight">{cell.label}</p>
                      <p className="opacity-70 text-[10px] mt-0.5">{cell.type} · {cell.room}</p>
                      <p className="opacity-60 text-[10px] mt-0.5 truncate">{cell.prof}</p>
                    </div>
                  ) : (
                    <div key={key} className="rounded-xl bg-slate-50 min-h-[56px] border border-slate-100" />
                  )
                })}
              </>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-50">
          {[
            { color: 'blue',   label: 'Cours magistral' },
            { color: 'green',  label: 'Travaux pratiques' },
            { color: 'amber',  label: 'Travaux dirigés' },
            { color: 'purple', label: 'Examen / contrôle' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className={`w-2.5 h-2.5 rounded ${COLORS[color].split(' ')[0]}`} />
              {label}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}