import { useAuth }      from '../../context/AuthContext'
import StatCard         from '../../components/ui/StatCard'
import Card             from '../../components/ui/Card'
import GradeBar         from '../../components/ui/GradeBar'
import NotifItem        from '../../components/ui/NotifItem'
import ResourceItem     from '../../components/ui/ResourceItem'

/* ── Mock data (remplace par appels API) ── */
const STATS = [
  { label: 'Moyenne générale', value: '13.4', sub: 'Semestre 3' },
  { label: 'Crédits validés',  value: '24',   sub: 'sur 30 ce sem.' },
  { label: 'Cours consultés',  value: '18',   sub: 'cette semaine' },
  { label: 'Absences',         value: '2',    sub: 'ce semestre', valueColor: 'text-red-600' },
]

const NOTES = [
  { label: 'Électronique analogique', value: 14.5 },
  { label: 'Réseaux informatiques',   value: 12.0 },
  { label: 'Traitement du signal',    value: 15.5 },
  { label: 'Mathématiques appliquées',value: 11.0 },
]

const NOTIFS = [
  { message: 'Note de TP Réseaux disponible',    time: 'Il y a 2h',  color: 'blue'  },
  { message: 'Examen Signal reporté au 15/04',   time: 'Hier',       color: 'amber' },
  { message: 'Nouveau cours déposé : Antennes',  time: 'Il y a 2j',  color: 'green' },
]

const RESOURCES = [
  { title: 'Cours 4 — Modulation AM/FM',         meta: 'Électronique · Prof. Razafindrakoto · PDF · 2.3 Mo', type: 'PDF' },
  { title: 'TP 2 — Configuration routeur Cisco', meta: 'Réseaux · Prof. Andriamanjato · ZIP · 5.1 Mo',        type: 'ZIP' },
  { title: 'Exercices — Transformée de Fourier', meta: 'Signal · Prof. Randriamanantena · PDF · 1.1 Mo',       type: 'PDF' },
]

/* ── Timetable ── */
const DAYS  = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven']
const SLOTS = ['07h30', '10h00', '13h30']
const COLORS = {
  blue:   'bg-blue-50 text-blue-800',
  green:  'bg-green-50 text-green-800',
  amber:  'bg-amber-50 text-amber-800',
  purple: 'bg-purple-50 text-purple-800',
}
const EDT = {
  '07h30-Lun': { label: 'Électronique', room: 'Salle B12', color: 'blue'   },
  '07h30-Mer': { label: 'Réseaux',      room: 'Labo 2',    color: 'green'  },
  '07h30-Ven': { label: 'Signal',       room: 'Salle A4',  color: 'purple' },
  '10h00-Mar': { label: 'Maths App.',   room: 'Amphi C',   color: 'amber'  },
  '10h00-Jeu': { label: 'Électronique', room: 'Labo 1',    color: 'blue'   },
  '13h30-Lun': { label: 'Réseaux',      room: 'Salle B12', color: 'green'  },
  '13h30-Jeu': { label: 'Signal',       room: 'Amphi A',   color: 'purple' },
  '13h30-Ven': { label: 'Maths App.',   room: 'Salle A4',  color: 'amber'  },
}

function Timetable() {
  return (
    <div className="overflow-x-auto">
      <div className="grid gap-1" style={{ gridTemplateColumns: '52px repeat(5, 1fr)', minWidth: 340 }}>
        {/* Header row */}
        <div />
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-slate-500 py-1">{d}</div>
        ))}

        {/* Slot rows */}
        {SLOTS.map(slot => (
          <>
            <div key={`time-${slot}`} className="text-[10px] text-slate-400 pt-1.5">{slot}</div>
            {DAYS.map(day => {
              const key    = `${slot}-${day}`
              const cell   = EDT[key]
              return cell ? (
                <div key={key} className={`rounded-md p-1.5 text-[10px] leading-tight min-h-[40px] ${COLORS[cell.color]}`}>
                  <p className="font-semibold">{cell.label}</p>
                  <p className="opacity-70">{cell.room}</p>
                </div>
              ) : (
                <div key={key} className="rounded-md bg-slate-50 min-h-[40px]" />
              )
            })}
          </>
        ))}
      </div>
    </div>
  )
}

export default function DashboardEtudiant() {
  const { user } = useAuth()

  return (
    <div className="fade-in space-y-5">
      {/* Welcome */}
      <div className="mb-1">
        <h2 className="text-base font-semibold text-slate-800">
          Bonjour, {user?.prenom || 'étudiant'} 👋
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Voici un résumé de votre parcours ce semestre.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Timetable + right column */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Timetable — 3 cols */}
        <div className="xl:col-span-3">
          <Card title="Emploi du temps — semaine en cours">
            <Timetable />
          </Card>
        </div>

        {/* Right column — 2 cols */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <Card title="Notes par UE">
            {NOTES.map((n, i) => (
              <GradeBar key={n.label} label={n.label} value={n.value} colorIndex={i} />
            ))}
          </Card>

          <Card title="Notifications récentes">
            {NOTIFS.map((n, i) => <NotifItem key={i} {...n} />)}
          </Card>
        </div>
      </div>

      {/* Resources */}
      <Card title="Ressources récentes">
        {RESOURCES.map((r, i) => <ResourceItem key={i} {...r} />)}
      </Card>
    </div>
  )
}