import Card from '../../components/ui/Card'
import Pill from '../../components/ui/Pill'

const POINTAGES = [
  { date: '09/04/2026', cours: 'Électronique — Cours',   heure: '07h30', statut: 'Présent',  salle: 'Salle B12' },
  { date: '08/04/2026', cours: 'Réseaux — TP',           heure: '07h30', statut: 'Présent',  salle: 'Labo 2'    },
  { date: '07/04/2026', cours: 'Signal — Cours',          heure: '07h30', statut: 'Absent',   salle: 'Salle A4'  },
  { date: '07/04/2026', cours: 'Maths App. — TD',        heure: '13h30', statut: 'Présent',  salle: 'Amphi C'   },
  { date: '03/04/2026', cours: 'Électronique — TP',      heure: '10h00', statut: 'Présent',  salle: 'Labo 1'    },
  { date: '02/04/2026', cours: 'Signal — TD',             heure: '13h30', statut: 'Absent',   salle: 'Amphi A'   },
]

const stats = {
  total:   POINTAGES.length,
  present: POINTAGES.filter(p => p.statut === 'Présent').length,
  absent:  POINTAGES.filter(p => p.statut === 'Absent').length,
}

export default function PointagePage() {
  return (
    <div className="fade-in space-y-4">
      <div className="mb-1">
        <h2 className="text-base font-semibold text-slate-800">Pointage — Semestre 3</h2>
        <p className="text-xs text-slate-400 mt-0.5">Historique de vos présences aux cours.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Séances totales</p>
          <p className="text-2xl font-semibold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Présences</p>
          <p className="text-2xl font-semibold text-green-700">{stats.present}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Absences</p>
          <p className="text-2xl font-semibold text-red-600">{stats.absent}</p>
        </div>
      </div>

      <Card title="Historique de pointage">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-50 text-slate-400">
                <th className="text-left pb-2.5 font-medium">Date</th>
                <th className="text-left pb-2.5 font-medium">Cours</th>
                <th className="text-left pb-2.5 font-medium">Heure</th>
                <th className="text-left pb-2.5 font-medium">Salle</th>
                <th className="text-left pb-2.5 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {POINTAGES.map((p, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5 text-slate-600">{p.date}</td>
                  <td className="py-2.5 text-slate-800 font-medium">{p.cours}</td>
                  <td className="py-2.5 text-slate-500">{p.heure}</td>
                  <td className="py-2.5 text-slate-500">{p.salle}</td>
                  <td className="py-2.5">
                    <Pill label={p.statut} color={p.statut === 'Présent' ? 'green' : 'red'} />
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