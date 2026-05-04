import { useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Pill from '../../components/ui/Pill'

const STRUCTURES = [
  { id: 1, nom: 'Licence Informatique', type: 'Formation', statut: 'Actif', niveaux: 3, etudiants: 150 },
  { id: 2, nom: 'Licence Électronique', type: 'Formation', statut: 'Actif', niveaux: 3, etudiants: 120 },
  { id: 3, nom: 'L1 Informatique', type: 'Niveau', statut: 'Actif', niveaux: 2, etudiants: 50 },
  { id: 4, nom: 'Semestre 3 L2', type: 'Semestre', statut: 'Actif', niveaux: 1, etudiants: 45 },
]

export default function StructuresAcademiques() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Tous')

  const TYPES = ['Tous', 'Formation', 'Niveau', 'Semestre']

  const filtered = STRUCTURES.filter(s => {
    const matchSearch = s.nom.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'Tous' || s.type === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="fade-in space-y-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Structures Académiques</h2>
        <p className="text-sm text-slate-500 mt-1">Formations, Niveaux et Semestres</p>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-wrap gap-2 items-center flex-1">
            <input
              type="text"
              placeholder="Rechercher une structure…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white w-56"
            />
            <div className="flex gap-1.5">
              {TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    filter === type
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <Button>+ Ajouter</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="text-left pb-3 font-medium">Nom</th>
                <th className="text-left pb-3 font-medium">Type</th>
                <th className="text-center pb-3 font-medium">Statut</th>
                <th className="text-center pb-3 font-medium">Étudiants</th>
                <th className="text-center pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-medium text-slate-800">{s.nom}</td>
                  <td className="py-3 text-slate-500">{s.type}</td>
                  <td className="py-3 text-center">
                    <Pill label={s.statut} color="Validé" />
                  </td>
                  <td className="py-3 text-center text-slate-700">{s.etudiants}</td>
                  <td className="py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">Modifier</button>
                      {s.statut === 'Actif' && (
                        <button className="text-amber-600 hover:text-amber-800">Désactiver</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">Aucune structure trouvée.</p>
        )}
      </Card>
    </div>
  )
}
