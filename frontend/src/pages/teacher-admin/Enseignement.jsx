import { useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Pill from '../../components/ui/Pill'

const ENSEIGNEMENTS = [
  { id: 1, ue: 'Électronique Analogique', code: 'EA-301', credits: 3, composantes: 2, enseignant: 'Prof. Razafindrakoto', semestre: 3 },
  { id: 2, ue: 'Réseaux Informatiques', code: 'RI-302', credits: 4, composantes: 2, enseignant: 'Prof. Andriamanjato', semestre: 3 },
  { id: 3, ue: 'Traitement du Signal', code: 'TS-301', credits: 3, composantes: 1, enseignant: 'Prof. Randriamanantena', semestre: 3 },
  { id: 4, ue: 'Programmation Avancée', code: 'PA-401', credits: 4, composantes: 2, enseignant: 'Prof. Razakamanana', semestre: 4 },
]

export default function Enseignement() {
  const [search, setSearch] = useState('')

  const filtered = ENSEIGNEMENTS.filter(e =>
    e.ue.toLowerCase().includes(search.toLowerCase()) ||
    e.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fade-in space-y-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Enseignement</h2>
        <p className="text-sm text-slate-500 mt-1">Unités, Composantes et Affectations</p>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Rechercher une UE…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white w-56"
          />
          <Button>+ Ajouter UE</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="text-left pb-3 font-medium">UE</th>
                <th className="text-left pb-3 font-medium">Code</th>
                <th className="text-center pb-3 font-medium">Crédits</th>
                <th className="text-center pb-3 font-medium">Composantes</th>
                <th className="text-left pb-3 font-medium">Enseignant</th>
                <th className="text-center pb-3 font-medium">Semestre</th>
                <th className="text-center pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-medium text-slate-800">{e.ue}</td>
                  <td className="py-3 text-slate-500 font-mono">{e.code}</td>
                  <td className="py-3 text-center">
                    <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded">{e.credits}</span>
                  </td>
                  <td className="py-3 text-center text-slate-700">{e.composantes}</td>
                  <td className="py-3 text-slate-600">{e.enseignant}</td>
                  <td className="py-3 text-center text-slate-700">S{e.semestre}</td>
                  <td className="py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-800">Modifier</button>
                      <button className="text-green-600 hover:text-green-800">Détails</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">Aucune UE trouvée.</p>
        )}
      </Card>
    </div>
  )
}
