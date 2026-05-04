import { useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Pill from '../../components/ui/Pill'
import Avatar from '../../components/ui/Avatar'

const INSCRIPTIONS = [
  { id: 1, etudiant: 'Rakoto Ny Aina', matricule: 'ETU-001', ue: 'Électronique Analogique', semestre: 3, date: '15/09/2025', statut: 'Confirmée' },
  { id: 2, etudiant: 'Rabe Miora', matricule: 'ETU-002', ue: 'Réseaux Informatiques', semestre: 3, date: '16/09/2025', statut: 'Confirmée' },
  { id: 3, etudiant: 'Andry Hasina', matricule: 'ETU-003', ue: 'Traitement du Signal', semestre: 3, date: '15/09/2025', statut: 'En attente' },
  { id: 4, etudiant: 'Voahangy Solo', matricule: 'ETU-004', ue: 'Électronique Analogique', semestre: 3, date: '17/09/2025', statut: 'Confirmée' },
]

export default function Inscriptions() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Tous')

  const STATUTS = ['Tous', 'Confirmée', 'En attente', 'Rejetée']

  const filtered = INSCRIPTIONS.filter(i => {
    const matchSearch = `${i.etudiant} ${i.matricule}`.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'Tous' || i.statut === filter
    return matchSearch && matchFilter
  })

  const stats = {
    total: INSCRIPTIONS.length,
    confirmees: INSCRIPTIONS.filter(i => i.statut === 'Confirmée').length,
    attente: INSCRIPTIONS.filter(i => i.statut === 'En attente').length,
  }

  return (
    <div className="fade-in space-y-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Inscriptions</h2>
        <p className="text-sm text-slate-500 mt-1">Gestion des enrollements étudiants</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Confirmées', value: stats.confirmees, color: 'text-green-700' },
          { label: 'En attente', value: stats.attente, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color || 'text-slate-900'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-wrap gap-2 items-center flex-1">
            <input
              type="text"
              placeholder="Rechercher un étudiant…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white w-56"
            />
            <div className="flex gap-1.5">
              {STATUTS.map(statut => (
                <button
                  key={statut}
                  onClick={() => setFilter(statut)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    filter === statut
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {statut}
                </button>
              ))}
            </div>
          </div>
          <Button>+ Inscrire</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="text-left pb-3 font-medium">Étudiant</th>
                <th className="text-left pb-3 font-medium">Matricule</th>
                <th className="text-left pb-3 font-medium">UE Inscrite</th>
                <th className="text-center pb-3 font-medium">Semestre</th>
                <th className="text-center pb-3 font-medium">Date</th>
                <th className="text-center pb-3 font-medium">Statut</th>
                <th className="text-center pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i, idx) => (
                <tr key={i.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={i.etudiant} size="sm" colorIndex={idx % 5} />
                      <span className="font-medium text-slate-800">{i.etudiant}</span>
                    </div>
                  </td>
                  <td className="py-3 text-slate-400 font-mono">{i.matricule}</td>
                  <td className="py-3 text-slate-600">{i.ue}</td>
                  <td className="py-3 text-center text-slate-700">S{i.semestre}</td>
                  <td className="py-3 text-center text-slate-600">{i.date}</td>
                  <td className="py-3 text-center">
                    <Pill label={i.statut} color={i.statut === 'Confirmée' ? 'Validé' : 'En attente'} />
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">Consulter</button>
                      <button className="text-red-600 hover:text-red-800">Annuler</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">Aucune inscription trouvée.</p>
        )}
      </Card>
    </div>
  )
}
