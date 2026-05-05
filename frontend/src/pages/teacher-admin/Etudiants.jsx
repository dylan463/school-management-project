import { useState } from 'react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Pill from '../../components/ui/Pill'
import Avatar from '../../components/ui/Avatar'

const ETUDIANTS_INITIAL = [
  { id: 1, matricule: 'ETU-001', nom: 'Rakoto', prenom: 'Ny Aina', email: 'rakoto@espa.mg', statut: 'Actif', niveau: 'L1' },
  { id: 2, matricule: 'ETU-002', nom: 'Rabe', prenom: 'Miora', email: 'rabe@espa.mg', statut: 'Actif', niveau: 'L1' },
  { id: 3, matricule: 'ETU-003', nom: 'Andrianampoinimerina', prenom: 'Jean', email: 'jean@espa.mg', statut: 'Actif', niveau: 'L2' },
  { id: 4, matricule: 'ETU-004', nom: 'Rajoelina', prenom: 'Marie', email: 'marie@espa.mg', statut: 'Actif', niveau: 'L2' },
  { id: 5, matricule: 'ETU-005', nom: 'Rasoa', prenom: 'Philippe', email: 'philippe@espa.mg', statut: 'Inactif', niveau: 'L3' },
]

const NIVEAUX = ['L1', 'L2', 'L3', 'M1', 'M2']

function renderTable(rows) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400">
            <th className="text-left pb-3 font-medium">Étudiant</th>
            <th className="text-left pb-3 font-medium">Matricule</th>
            <th className="text-left pb-3 font-medium">Email</th>
            <th className="text-center pb-3 font-medium">Statut</th>
            <th className="text-center pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((etudiant, i) => (
            <tr key={etudiant.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
              <td className="py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar name={`${etudiant.prenom} ${etudiant.nom}`} size="sm" colorIndex={i % 5} />
                  <span className="font-medium text-slate-800">{etudiant.prenom} {etudiant.nom}</span>
                </div>
              </td>
              <td className="py-3 text-slate-400 font-mono">{etudiant.matricule}</td>
              <td className="py-3 text-slate-500">{etudiant.email}</td>
              <td className="py-3 text-center">
                <Pill label={etudiant.statut} color={etudiant.statut === 'Actif' ? 'Validé' : 'En attente'} />
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

function ModalAjoutEtudiant({ isOpen, onClose, onAdd, niveaux }) {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    niveau: 'L1',
    statut: 'Actif',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd(formData)
    setFormData({ prenom: '', nom: '', email: '', niveau: 'L1', statut: 'Actif' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Ajouter un étudiant</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Prénom</label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Ex: Ny Aina"
              required
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nom</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Ex: Rakoto"
              required
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ex: etudiant@espa.mg"
              required
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Niveau</label>
            <select
              name="niveau"
              value={formData.niveau}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none bg-white"
            >
              {niveaux.map(niveau => (
                <option key={niveau} value={niveau}>{niveau}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Statut</label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none bg-white"
            >
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Etudiants() {
  const [search, setSearch] = useState('')
  const [etudiants, setEtudiants] = useState(ETUDIANTS_INITIAL)
  const [showModal, setShowModal] = useState(false)

  const filtered = etudiants.filter((etudiant) => {
    const text = `${etudiant.prenom} ${etudiant.nom} ${etudiant.matricule}`.toLowerCase()
    return text.includes(search.toLowerCase())
  })

  // Grouper par niveau
  const groupedByNiveau = NIVEAUX.reduce((acc, niveau) => {
    const students = filtered.filter(e => e.niveau === niveau)
    if (students.length > 0) {
      acc.push({ niveau, students })
    }
    return acc
  }, [])

  const handleAddEtudiant = (formData) => {
    const newId = Math.max(...etudiants.map(e => e.id), 0) + 1
    const matricule = `ETU-${String(newId).padStart(3, '0')}`
    
    const newEtudiant = {
      id: newId,
      matricule,
      prenom: formData.prenom,
      nom: formData.nom,
      email: formData.email,
      statut: formData.statut,
      niveau: formData.niveau,
    }
    
    setEtudiants([...etudiants, newEtudiant])
    setShowModal(false)
  }

  return (
    <div className="fade-in space-y-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Étudiants</h2>
        <p className="text-sm text-slate-500 mt-1">Gérer les inscriptions et profils étudiants par niveau</p>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <input
            type="text"
            placeholder="Rechercher un étudiant…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white w-full sm:w-56"
          />
          <Button onClick={() => setShowModal(true)}>+ Ajouter</Button>
        </div>

        {groupedByNiveau.length > 0 ? (
          <div className="space-y-8">
            {groupedByNiveau.map(({ niveau, students }) => (
              <section key={niveau}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Niveau {niveau}</h3>
                  <span className="text-xs text-slate-500">{students.length} résultat{students.length > 1 ? 's' : ''}</span>
                </div>
                {renderTable(students)}
              </section>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400 text-sm py-8">Aucun étudiant trouvé.</p>
        )}
      </Card>

      <ModalAjoutEtudiant
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAddEtudiant}
        niveaux={NIVEAUX}
      />
    </div>
  )
}
