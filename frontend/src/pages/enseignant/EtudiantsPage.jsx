import { useState } from 'react'
import Card  from '../../components/ui/Card'
import Pill  from '../../components/ui/Pill'
import Avatar from '../../components/ui/Avatar'

const ETUDIANTS = [
  { matricule: 'ETU-001', nom: 'Rakoto',    prenom: 'Ny Aina',  email: 'rakoto@espa.mg',    ue: 'Électronique', tp: 14, exam: 15, statut: 'Validé'     },
  { matricule: 'ETU-002', nom: 'Rabe',      prenom: 'Miora',    email: 'rabe@espa.mg',      ue: 'Électronique', tp: 12, exam: null,statut: 'En attente' },
  { matricule: 'ETU-003', nom: 'Andry',     prenom: 'Hasina',   email: 'andry@espa.mg',     ue: 'Électronique', tp: 9,  exam: 8,  statut: 'Insuffisant' },
  { matricule: 'ETU-004', nom: 'Voahangy',  prenom: 'Solo',     email: 'voahangy@espa.mg',  ue: 'Électronique', tp: 16, exam: 17, statut: 'Validé'     },
  { matricule: 'ETU-005', nom: 'Fenitra',   prenom: 'Alain',    email: 'fenitra@espa.mg',   ue: 'Électronique', tp: 13, exam: null,statut: 'En attente' },
  { matricule: 'ETU-006', nom: 'Ramana',    prenom: 'Tsiory',   email: 'ramana@espa.mg',    ue: 'Électronique', tp: 11, exam: 12, statut: 'Validé'     },
  { matricule: 'ETU-007', nom: 'Andriamana',prenom: 'Fanja',    email: 'fanja@espa.mg',     ue: 'Électronique', tp: 15, exam: 14, statut: 'Validé'     },
  { matricule: 'ETU-008', nom: 'Rasolofo',  prenom: 'Hery',     email: 'hery@espa.mg',      ue: 'Électronique', tp: 8,  exam: 7,  statut: 'Insuffisant' },
]

export default function EtudiantsPage() {
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('Tous')

  const STATUTS = ['Tous', 'Validé', 'En attente', 'Insuffisant']

  const filtered = ETUDIANTS.filter(e => {
    const matchSearch = `${e.prenom} ${e.nom} ${e.matricule}`.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'Tous' || e.statut === filter
    return matchSearch && matchFilter
  })

  const counts = {
    total:       ETUDIANTS.length,
    valide:      ETUDIANTS.filter(e => e.statut === 'Validé').length,
    attente:     ETUDIANTS.filter(e => e.statut === 'En attente').length,
    insuffisant: ETUDIANTS.filter(e => e.statut === 'Insuffisant').length,
  }

  return (
    <div className="fade-in space-y-5">
      <div className="mb-1">
        <h2 className="text-base font-semibold text-slate-800">Mes étudiants</h2>
        <p className="text-xs text-slate-400 mt-0.5">Électronique analogique — Semestre 3</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total inscrits',  value: counts.total,       color: 'text-slate-900' },
          { label: 'Validés',          value: counts.valide,      color: 'text-green-700' },
          { label: 'En attente',       value: counts.attente,     color: 'text-amber-600' },
          { label: 'Insuffisants',     value: counts.insuffisant, color: 'text-red-600'   },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <Card>
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <input
            type="text"
            placeholder="Rechercher un étudiant…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white w-56"
          />
          <div className="flex gap-1.5">
            {STATUTS.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  filter === s
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="text-left pb-3 font-medium">Étudiant</th>
                <th className="text-left pb-3 font-medium">Matricule</th>
                <th className="text-left pb-3 font-medium">Email</th>
                <th className="text-center pb-3 font-medium">Note TP</th>
                <th className="text-center pb-3 font-medium">Note Exam</th>
                <th className="text-center pb-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={e.matricule} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${e.prenom} ${e.nom}`} size="sm" colorIndex={i % 5} />
                      <span className="font-medium text-slate-800">{e.prenom} {e.nom}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-400 font-mono">{e.matricule}</td>
                  <td className="py-3 text-slate-500">{e.email}</td>
                  <td className="py-3 text-center font-medium text-slate-700">{e.tp}</td>
                  <td className="py-3 text-center font-medium text-slate-700">{e.exam ?? <span className="text-slate-300">—</span>}</td>
                  <td className="py-3 text-center"><Pill label={e.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">Aucun étudiant trouvé.</p>
        )}
      </Card>
    </div>
  )
}