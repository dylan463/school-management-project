import { useAuth }    from '../../context/AuthContext'
import StatCard       from '../../components/ui/StatCard'
import Card           from '../../components/ui/Card'
import Pill           from '../../components/ui/Pill'
import NotifItem      from '../../components/ui/NotifItem'

const STATS = [
  { label: 'Étudiants encadrés', value: '87',  sub: 'ce semestre' },
  { label: 'UE actives',          value: '3',   sub: 'cours dispensés' },
  { label: 'Notes à saisir',      value: '24',  sub: 'en attente', valueColor: 'text-amber-600' },
  { label: 'Ressources déposées', value: '11',  sub: 'ce semestre' },
]

const ETUDIANTS = [
  { matricule: 'ETU-001', nom: 'Rakoto Ny Aina', tp: 14, exam: 15, statut: 'Validé'     },
  { matricule: 'ETU-002', nom: 'Rabe Miora',      tp: 12, exam: null, statut: 'En attente' },
  { matricule: 'ETU-003', nom: 'Andry Hasina',    tp: 9,  exam: 8,  statut: 'Insuffisant' },
  { matricule: 'ETU-004', nom: 'Voahangy Solo',   tp: 16, exam: 17, statut: 'Validé'     },
  { matricule: 'ETU-005', nom: 'Fenitra Alain',   tp: 13, exam: null, statut: 'En attente' },
]

const PLANNING = [
  { time: 'Lun 07h30', cours: 'Électronique — Cours magistral', room: 'Salle B12 · 2h' },
  { time: 'Mar 10h00', cours: 'Électronique — TP Labo',         room: 'Labo 1 · 3h'    },
  { time: 'Jeu 13h30', cours: 'Antennes — Cours',               room: 'Amphi A · 2h'   },
  { time: 'Ven 07h30', cours: 'Antennes — TD',                  room: 'Salle A4 · 2h'  },
]

const RESSOURCES = [
  { titre: 'Cours 4 — Modulation AM/FM', consultations: 47, bg: 'bg-blue-50' },
  { titre: 'TD 3 — Filtres actifs',       consultations: 38, bg: 'bg-amber-50' },
]

const EVALUATIONS = [
  { ec: 'Électronique — EC1', type: 'Examen', date: '14/04/2026', saisi: 0,  total: 87 },
  { ec: 'Électronique — EC2', type: 'TP',     date: 'passé',      saisi: 87, total: 87 },
  { ec: 'Antennes — EC1',     type: 'Examen', date: '20/04/2026', saisi: 0,  total: 52 },
]

const NOTIFS = [
  { message: 'Rappel : 24 notes à saisir avant le 14/04', time: "Aujourd'hui", color: 'amber' },
]

export default function DashboardEnseignant() {
  const { user } = useAuth()

  return (
    <div className="fade-in space-y-5">
      {/* Welcome */}
      <div className="mb-1">
        <h2 className="text-base font-semibold text-slate-800">
          Bonjour, {user?.prenom || 'Professeur'} 👋
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Voici un aperçu de vos activités pédagogiques.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Students + Right column */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Students table — 3 cols */}
        <div className="xl:col-span-3">
          <Card title="Étudiants — Électronique analogique">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-50 text-slate-400">
                    <th className="text-left pb-2 font-medium">Matricule</th>
                    <th className="text-left pb-2 font-medium">Nom</th>
                    <th className="text-center pb-2 font-medium">TP</th>
                    <th className="text-center pb-2 font-medium">Examen</th>
                    <th className="text-center pb-2 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {ETUDIANTS.map(e => (
                    <tr key={e.matricule} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 text-slate-400">{e.matricule}</td>
                      <td className="py-2.5 text-slate-800 font-medium">{e.nom}</td>
                      <td className="py-2.5 text-center text-slate-700">{e.tp}</td>
                      <td className="py-2.5 text-center text-slate-700">{e.exam ?? '—'}</td>
                      <td className="py-2.5 text-center"><Pill label={e.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right column — 2 cols */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <Card title="Planning de la semaine">
            {PLANNING.map((p, i) => (
              <div key={i} className="flex gap-2.5 py-2 border-b border-slate-50 last:border-0">
                <span className="text-[10px] text-slate-400 min-w-[60px] pt-0.5">{p.time}</span>
                <div>
                  <p className="text-xs font-medium text-slate-800">{p.cours}</p>
                  <p className="text-[10px] text-slate-400">{p.room}</p>
                </div>
              </div>
            ))}
          </Card>

          <Card title="Ressources déposées">
            {RESSOURCES.map((r, i) => (
              <div key={i} className="flex items-center gap-2.5 py-2 border-b border-slate-50 last:border-0">
                <div className={`w-8 h-8 ${r.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 16 16">
                    <path d="M3.5 2h5l4 4v7.5a1 1 0 01-1 1h-8a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{r.titre}</p>
                  <p className="text-[10px] text-slate-400">{r.consultations} consultations</p>
                </div>
              </div>
            ))}
            <button className="mt-2 w-full text-xs text-blue-600 font-medium py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-dashed border-blue-200">
              + Déposer une ressource
            </button>
          </Card>

          <Card title="Notifications">
            {NOTIFS.map((n, i) => <NotifItem key={i} {...n} />)}
          </Card>
        </div>
      </div>

      {/* Evaluations */}
      <Card
        title="Évaluations — saisie des notes"
        action={
          <button className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
            Saisir des notes
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-50 text-slate-400">
                <th className="text-left pb-2 font-medium">Élément constitutif</th>
                <th className="text-center pb-2 font-medium">Type</th>
                <th className="text-center pb-2 font-medium">Date</th>
                <th className="text-center pb-2 font-medium">Notes saisies</th>
              </tr>
            </thead>
            <tbody>
              {EVALUATIONS.map((ev, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5 text-slate-800 font-medium">{ev.ec}</td>
                  <td className="py-2.5 text-center"><Pill label={ev.type} /></td>
                  <td className="py-2.5 text-center text-slate-500">{ev.date}</td>
                  <td className="py-2.5 text-center">
                    <Pill
                      label={`${ev.saisi} / ${ev.total}`}
                      color={ev.saisi === ev.total ? 'green' : ev.saisi === 0 ? 'amber' : 'blue'}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}