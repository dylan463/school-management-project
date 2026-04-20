import Card  from '../../components/ui/Card'
import Pill  from '../../components/ui/Pill'

const UES = [
  {
    code: 'UE-ELA', libelle: 'Électronique analogique', credits: 6, moyenne: 14.5,
    ecs: [
      { code: 'EC1', libelle: 'Circuits RLC', tp: 14, exam: 15, coefTP: 0.4, coefExam: 0.6 },
      { code: 'EC2', libelle: 'Amplificateurs', tp: 13, exam: null, coefTP: 0.4, coefExam: 0.6 },
    ],
  },
  {
    code: 'UE-RES', libelle: 'Réseaux informatiques', credits: 5, moyenne: 12.0,
    ecs: [
      { code: 'EC1', libelle: 'Architecture TCP/IP', tp: 12, exam: 12, coefTP: 0.4, coefExam: 0.6 },
      { code: 'EC2', libelle: 'Configuration routeurs', tp: 11, exam: 13, coefTP: 0.5, coefExam: 0.5 },
    ],
  },
  {
    code: 'UE-SIG', libelle: 'Traitement du signal', credits: 6, moyenne: 15.5,
    ecs: [
      { code: 'EC1', libelle: 'Transformée de Fourier', tp: 16, exam: 15, coefTP: 0.4, coefExam: 0.6 },
      { code: 'EC2', libelle: 'Filtres numériques', tp: 15, exam: 16, coefTP: 0.4, coefExam: 0.6 },
    ],
  },
]

const colorFor = (v) => {
  if (v === null) return 'text-slate-400'
  if (v >= 14) return 'text-green-700 font-semibold'
  if (v >= 10) return 'text-slate-800 font-semibold'
  return 'text-red-600 font-semibold'
}

const statut = (v) => {
  if (v === null) return 'En attente'
  return v >= 10 ? 'Validé' : 'Insuffisant'
}

export default function NotesPage() {
  return (
    <div className="fade-in space-y-5">
      <div className="mb-1">
        <h2 className="text-base font-semibold text-slate-800">Mes notes — Semestre 3</h2>
        <p className="text-xs text-slate-400 mt-0.5">Résultats par unité d'enseignement et par élément constitutif.</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Moyenne générale</p>
          <p className="text-2xl font-semibold text-slate-900">13.4</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Crédits validés</p>
          <p className="text-2xl font-semibold text-green-700">17</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">En attente</p>
          <p className="text-2xl font-semibold text-amber-600">4</p>
        </div>
      </div>

      {/* Per UE */}
      {UES.map(ue => (
        <Card key={ue.code}>
          {/* UE header */}
          <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{ue.code}</span>
                <h3 className="text-sm font-semibold text-slate-800">{ue.libelle}</h3>
              </div>
              <p className="text-xs text-slate-400">{ue.credits} crédits</p>
            </div>
            <div className="text-right">
              <p className={`text-xl ${colorFor(ue.moyenne)}`}>{ue.moyenne}/20</p>
              <Pill label={statut(ue.moyenne)} />
            </div>
          </div>

          {/* EC table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-50">
                  <th className="text-left pb-2 font-medium">Code</th>
                  <th className="text-left pb-2 font-medium">Élément constitutif</th>
                  <th className="text-center pb-2 font-medium">Note TP</th>
                  <th className="text-center pb-2 font-medium">Note Examen</th>
                  <th className="text-center pb-2 font-medium">Moyenne EC</th>
                  <th className="text-center pb-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {ue.ecs.map(ec => {
                  const moy = ec.tp !== null && ec.exam !== null
                    ? (ec.tp * ec.coefTP + ec.exam * ec.coefExam).toFixed(1)
                    : null
                  return (
                    <tr key={ec.code} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 text-slate-400">{ec.code}</td>
                      <td className="py-2.5 text-slate-700">{ec.libelle}</td>
                      <td className={`py-2.5 text-center ${colorFor(ec.tp)}`}>{ec.tp ?? '—'}</td>
                      <td className={`py-2.5 text-center ${colorFor(ec.exam)}`}>{ec.exam ?? '—'}</td>
                      <td className={`py-2.5 text-center ${colorFor(moy ? parseFloat(moy) : null)}`}>
                        {moy ?? '—'}
                      </td>
                      <td className="py-2.5 text-center">
                        <Pill label={statut(moy ? parseFloat(moy) : null)} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  )
}