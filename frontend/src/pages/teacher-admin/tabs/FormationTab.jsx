import { useState, useEffect } from "react"
import Button from "../../../components/ui/Button"
import Pill from "../../../components/ui/Pill"
import Card from "../../../components/ui/Card"
import Modal from "../../../components/Modal"
import ConfirmModal from "../../../components/ConfirmModal"
import structuresService from "../../../services/structuresService"
import extractDRFError from "../../../utils/extractError"
import { toast } from "react-toastify"

function FormulaireFormation({ formation = null, onClose, onSubmit, isEditing = false }) {
  const [label, setLabel] = useState(formation?.label || '')
  const [code, setCode] = useState(formation?.code || '')
  const [description, setDescription] = useState(formation?.description || '')
  const [fromLevel, setFromLevel] = useState('')
  const [toLevel, setToLevel] = useState('')
  const [niveaux, setNiveaux] = useState([])

  useEffect(() => {
    async function fetchNiveaux() {
      const response = await structuresService.levelService.getLevels()
      setNiveaux(response)
      
      // En mode édition, initialiser fromLevel et toLevel avec les IDs correspondants
      if (formation && formation.from_level && formation.to_level) {
        const fromNiveau = response.find(n => n.order === formation.from_level)
        const toNiveau = response.find(n => n.order === formation.to_level)
        if (fromNiveau) setFromLevel(fromNiveau.id.toString())
        if (toNiveau) setToLevel(toNiveau.id.toString())
      }
    }
    fetchNiveaux()
  }, [formation])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation côté client
    if (!label.trim()) {
      toast.error('Le nom de la formation est requis')
      return
    }
    
    if (!code.trim()) {
      toast.error('Le code de la formation est requis')
      return
    }
    
    if (!fromLevel || !toLevel) {
      toast.error('Les niveaux de début et de fin sont requis')
      return
    }
    
    const fromLevelObj = niveaux.find(n => n.id === parseInt(fromLevel))
    const toLevelObj = niveaux.find(n => n.id === parseInt(toLevel))
    
    if (!fromLevelObj || !toLevelObj) {
      toast.error('Les niveaux sélectionnés sont invalides')
      return
    }
    
    if (fromLevelObj.order > toLevelObj.order) {
      toast.error('Le niveau de début ne peut pas être supérieur au niveau de fin')
      return
    }
    
    const data = {
      label: label.trim(),
      code: code.trim(),
      description: description.trim(),
      from_level: fromLevelObj.order,
      to_level: toLevelObj.order,
    }
    try{
      await onSubmit(data)
      onClose()
    }catch(error){
      const errorMessage = extractDRFError(error)
      // Message d'erreur plus spécifique
      if (errorMessage.includes('This field is required')) {
        // Essayer de déterminer quel champ est requis
        if (errorMessage.includes('code')) {
          toast.error('Le code de la formation est requis')
        } else {
          toast.error('Le nom de la formation est requis')
        }
      } else if (errorMessage.includes('label')) {
        toast.error('Le nom de la formation est invalide')
      } else if (errorMessage.includes('code')) {
        toast.error('Le code de la formation est invalide')
      } else {
        toast.error(errorMessage || 'Une erreur est survenue')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Code de la formation
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex: ACAD"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Nom de la formation
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: Académique"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Niveau de début
          </label>
          <select
            value={fromLevel}
            onChange={(e) => setFromLevel(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
            required
          >
            <option value="">Sélectionner...</option>
            {niveaux.map((niveau) => (
              <option key={niveau.id} value={niveau.id}>
                {niveau.code} (Ordre: {niveau.order})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Niveau de fin
          </label>
          <select
            value={toLevel}
            onChange={(e) => setToLevel(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
            required
          >
            <option value="">Sélectionner...</option>
            {niveaux.map((niveau) => (
              <option key={niveau.id} value={niveau.id}>
                {niveau.code} (Ordre: {niveau.order})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description de la formation..."
          rows={3}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white resize-none"
        />
      </div>
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

export default function FormationTab() {
  const [formations, setFormations] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [openMenuId, setOpenMenuId] = useState(null)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    async function fetchFormations() {
      const params = {}
      if (debouncedSearch) params.search = debouncedSearch
      const response = await structuresService.FormationService.getFormations(params)
      setFormations(response)
    }
    fetchFormations()
  }, [debouncedSearch])

  const editingFormation = editingId ? formations.find(f => f.id === editingId) : null

  const handleAddFormation = async (formData) => {
    await structuresService.FormationService.createFormation(formData)
    const params = {}
    if (debouncedSearch) params.search = debouncedSearch
    
    const response = await structuresService.FormationService.getFormations(params)
    setFormations(response)
    toast.success('Formation ajoutée avec succès')
  }
  
  const handleEditFormation = async (formData) => {
    const updated = await structuresService.FormationService.updateFormation(editingId, formData)
    // Mettre à jour localement sans recharger toute la liste
    setFormations(formations.map(f => f.id === editingId ? updated : f))
    setEditingId(null)
    toast.success('Formation modifiée avec succès')
  }

  const handleDeleteFormation = async (id) => {
    try{
      await structuresService.FormationService.deleteFormation(id)
      // Recharger la liste avec les filtres actuels
      const params = {}
      if (debouncedSearch) params.search = debouncedSearch
      
      const response = await structuresService.FormationService.getFormations(params)
      setFormations(response)
      toast.success('Formation supprimée avec succès')
    }catch(error){
      toast.error(extractDRFError(error))
    }
  }

  const openDeleteConfirmModal = (id) => {
    setDeleteId(id)
    setDeleteConfirmModal(true)
    setOpenMenuId(null)
  }

  const closeDeleteConfirmModal = () => {
    setDeleteId(null)
    setDeleteConfirmModal(false)
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
        <h2 className="text-2xl font-bold text-slate-800">Formations</h2>
        <p className="text-sm text-slate-500 mt-1">Gérer les formations de l'établissement</p>
      </div>

      <Card>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              placeholder="Rechercher une formation…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white w-full sm:w-56"
            />
            <Button onClick={openAddModal}>+ Ajouter</Button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearch('')}
              disabled={!search}
              className={`px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none transition-colors ${
                search 
                  ? 'text-slate-600 hover:bg-slate-50 cursor-pointer' 
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {formations.length === 0 && debouncedSearch === "" ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500">
                Aucune formation disponible.
              </p>
            </div>
          ) : formations.length === 0 && debouncedSearch !== "" ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500">
                Aucun résultat trouvé pour « {debouncedSearch} ».
              </p>
            </div>
          ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="text-left pb-3 pl-3 font-medium">Id</th>
                    <th className="text-left pb-3 font-medium">Code</th>
                    <th className="text-left pb-3 font-medium">Nom</th>
                    <th className="text-left pb-3 font-medium">Description</th>
                    <th className="text-left pb-3 font-medium">Premier niveau</th>
                    <th className="text-left pb-3 font-medium">Dernier niveau</th>
                    <th className="text-center pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formations.map((formation) => (
                    <tr key={formation.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 pl-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-medium text-slate-800">{formation.id}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-slate-600 text-xs">{formation.code}</span>
                      </td>
                      <td className="py-3">
                        <span className="font-medium text-slate-700">{formation.label}</span>
                      </td>
                      <td className="py-3 text-slate-500">
                        <span className="line-clamp-2">
                          {formation.description || 'Aucune description'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-slate-600 text-xs">
                          {formation.first_level ? formation.first_level.code : '-'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-slate-600 text-xs">
                          {formation.last_level ? formation.last_level.code : '-'}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === formation.id ? null : formation.id)}
                            className="px-3 py-1 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded transition"
                          >
                            ⋮
                          </button>
                          
                          {openMenuId === formation.id && (
                            <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                              <button
                                onClick={() => {
                                  openEditModal(formation.id)
                                  setOpenMenuId(null)
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition first:rounded-t-lg"
                              >
                                Modifier
                              </button>
                              
                              <button
                                onClick={() => openDeleteConfirmModal(formation.id)}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-slate-200 last:rounded-b-lg"
                              >
                                Supprimer
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}                  
                </tbody>
              </table>          
            )}
        </div>
      </Card>

      {/* Modal pour ajouter/modifier une formation */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingId ? 'Modifier une formation' : 'Ajouter une formation'}
          </h3>
          <FormulaireFormation
            formation={editingFormation}
            onClose={closeModal}
            onSubmit={editingId ? handleEditFormation : handleAddFormation}
            isEditing={!!editingId}
          />
        </Modal>
      )}

      {/* Modal de confirmation pour la suppression */}
      <ConfirmModal
        isOpen={deleteConfirmModal}
        onClose={closeDeleteConfirmModal}
        onConfirm={() => handleDeleteFormation(deleteId)}
        title="Supprimer la formation"
        message="Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  )
}
