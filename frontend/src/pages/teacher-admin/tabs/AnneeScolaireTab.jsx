import { useState, useEffect } from "react"
import Button from "../../../components/ui/Button"
import Pill from "../../../components/ui/Pill"
import Card from "../../../components/ui/Card"
import Modal from "../../../components/Modal"
import structuresService from "../../../services/structuresService"
import extractDRFError from "../../../utils/extractError"

function FormulairAnneeScolaire({ anneeScolaire = null, onClose, onSubmit, isEditing = false }) {
  const [nom, setNom] = useState(anneeScolaire?.label || '')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nom.trim()) return
    
    const data = {
      label: nom.trim(),
    }
    try{
      await onSubmit(data)
      onClose()
    }catch(error){
      setError(extractDRFError(error))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Nom de l'année scolaire
        </label>
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Ex: 2024-2025"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        />
      </div>
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-2">
          {error}
        </div>
      )}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          {isEditing ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  )
}


export default function AnnéeScolaireTab() {
  const [anneesScolaires, setAnneesScolaires] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)

  // Charger les données au montage
  useEffect(() => {
    async function fetchAnneesScolaires() {
      const response = await structuresService.schoolYearsService.getSchoolYears()
      setAnneesScolaires(response)
    }
    fetchAnneesScolaires()
  }, [])

  const editingAnnee = editingId ? anneesScolaires.find(a => a.id === editingId) : null

  const handleAddAnnee = async (formData) => {
    await structuresService.schoolYearsService.createSchoolYear(formData)
    const response = await structuresService.schoolYearsService.getSchoolYears()
    setAnneesScolaires(response)
  }
  
  const handleEditAnnee = async (formData) => {
    const updated = await structuresService.schoolYearsService.updateSchoolYear(editingId, formData)
    // Mettre à jour localement sans recharger toute la liste
    setAnneesScolaires(anneesScolaires.map(a => a.id === editingId ? updated : a))
    setEditingId(null)
  }

  const handleDeleteAnnee = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette année scolaire ?')) {
      setAnneesScolaires(anneesScolaires.filter(a => a.id !== id))
      await structuresService.schoolYearsService.deleteSchoolYear(id)
    }
  }

  // Ouvrir le modal pour ajouter
  const openAddModal = () => {
    setEditingId(null)
    setIsModalOpen(true)
  }

  // Ouvrir le modal pour éditer
  const openEditModal = (id) => {
    setEditingId(id)
    setIsModalOpen(true)
  }

  // Fermer le modal
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingId(null)
  }

  return (
    <div className="fade-in space-y-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Années Scolaires</h2>
        <p className="text-sm text-slate-500 mt-1">Gérer les années scolaires de l'établissement</p>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <input
            type="text"
            placeholder="Rechercher une année scolaire…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white w-full sm:w-56"
          />
          <Button onClick={openAddModal}>+ Ajouter</Button>
        </div>

        <div className="space-y-3">
          {anneesScolaires.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500">
                {anneesScolaires.length === 0
                  ? 'Aucune année scolaire disponible.'
                  : 'Aucun résultat trouvé.'}
              </p>
            </div>
          ) : (
            anneesScolaires.map((annee) => (
              <div
                key={annee.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition"
              >
                <div>
                  <p className="font-medium text-slate-800">{annee.label}</p>
                  <p className="text-xs text-slate-500 mt-1">ID: {annee.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Pill label={annee.status} color={
                    annee.status === 'active' ? 'Validé' :
                    annee.status === 'closed' ? 'En attente' : 'Insuffisant'
                  } />
                  
                  {/* Menu déroulant */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === annee.id ? null : annee.id)}
                      className="px-3 py-1 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded transition"
                    >
                      ⋮
                    </button>
                    
                    {openMenuId === annee.id && (
                      <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => {
                            openEditModal(annee.id)
                            setOpenMenuId(null)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition first:rounded-t-lg"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteAnnee(annee.id)
                            setOpenMenuId(null)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition last:rounded-b-lg border-t border-slate-200"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Modal pour ajouter/modifier une année scolaire */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingId ? 'Modifier une année scolaire' : 'Ajouter une année scolaire'}
          </h3>
          <FormulairAnneeScolaire
            anneeScolaire={editingAnnee}
            onClose={closeModal}
            onSubmit={editingId ? handleEditAnnee : handleAddAnnee}
            isEditing={!!editingId}
          />
        </Modal>
      )}
    </div>
  )
}
