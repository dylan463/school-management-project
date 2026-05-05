import { useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Pill from '../../components/ui/Pill'
import Avatar from '../../components/ui/Avatar'

const ENSEIGNANTS = [
  { id: 1, matricule: 'ENS-001', nom: 'Razafindrakoto', prenom: 'Jean', email: 'razafindrakoto@espa.mg', statut: 'Actif' },
  { id: 2, matricule: 'ENS-002', nom: 'Andriamanjato', prenom: 'Marie', email: 'andriamanjato@espa.mg', statut: 'Inactif' },
]

function renderTable(rows) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400">
            <th className="text-left pb-3 font-medium">Enseignant</th>
            <th className="text-left pb-3 font-medium">Matricule</th>
            <th className="text-left pb-3 font-medium">Email</th>
            <th className="text-center pb-3 font-medium">Statut</th>
            <th className="text-center pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((enseignant, i) => (
            <tr key={enseignant.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
              <td className="py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar name={`${enseignant.prenom} ${enseignant.nom}`} size="sm" colorIndex={i % 5} />
                  <span className="font-medium text-slate-800">{enseignant.prenom} {enseignant.nom}</span>
                </div>
              </td>
              <td className="py-3 text-slate-400 font-mono">{enseignant.matricule}</td>
              <td className="py-3 text-slate-500">{enseignant.email}</td>
              <td className="py-3 text-center">
                <Pill label={enseignant.statut} color={enseignant.statut === 'Actif' ? 'Validé' : 'En attente'} />
              </td>
              <td className="py-3 text-center">
                <div className="flex gap-2 justify-center">
                  <button className="text-blue-600 hover:text-blue-800">Modifier</button>
                  <button className="text-red-600 hover:text-red-800">Supprimer</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Enseignants() {
  const [search, setSearch] = useState('')
  const filtered = ENSEIGNANTS.filter((enseignant) => {
    const text = `${enseignant.prenom} ${enseignant.nom} ${enseignant.matricule}`.toLowerCase()
    return text.includes(search.toLowerCase())
  })

  return (
    <div className="fade-in space-y-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Enseignants</h2>
        <p className="text-sm text-slate-500 mt-1">Gérer les enseignants et leurs profils</p>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <input
            type="text"
            placeholder="Rechercher un enseignant…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white w-full sm:w-56"
          />
          <Button>+ Ajouter</Button>
        </div>

        {filtered.length > 0 ? renderTable(filtered) : (
          <p className="text-center text-slate-400 text-sm py-8">Aucun enseignant trouvé.</p>
        )}
      </Card>
    </div>
  )
}
