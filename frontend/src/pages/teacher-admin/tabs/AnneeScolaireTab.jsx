import { useState, useEffect } from "react"
import Button from "../../../components/ui/Button"
import Pill from "../../../components/ui/Pill"
import Card from "../../../components/ui/Card"
import Modal from "../../../components/Modal"
import ConfirmModal from "../../../components/ConfirmModal"
import structuresService from "../../../services/structuresService"
import extractDRFError from "../../../utils/extractError"
import { toast } from "react-toastify"

function FormulairAnneeScolaire({ anneeScolaire = null, onClose, onSubmit, isEditing = false }) {
  const [nom, setNom] = useState(anneeScolaire?.label || '')

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
      toast.error(extractDRFError(error))
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

function mapStatusToPill(annee) {
  switch (annee.status) {
    case 'ACTIVE':
      if (annee.period === "FIRST") {
        return <Pill label="1ère période" variant="success" />
      }else{
        return <Pill label="2ème période" variant="success" />
      }
    case 'UPCOMING':
      return <Pill label="À venir" variant="warning" />
    case 'CLOSED':
      return <Pill label="Cloturée" variant="default" />
    default:
      return <Pill label="Inconnu" variant="default" />
  }
}


export default function AnnéeScolaireTab() {
  const [anneesScolaires, setAnneesScolaires] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [openMenuId, setOpenMenuId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [lockFilter, setLockFilter] = useState('')
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [endConfirmModal, setEndConfirmModal] = useState(false)
  const [endId, setEndId] = useState(null)


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    async function fetchAnneesScolaires() {
      const params = {}
      if (debouncedSearch) params.search = debouncedSearch
      if (statusFilter) params.status = statusFilter.toLowerCase()
      if (lockFilter !== '') params.is_locked = lockFilter === 'true'
      
      const response = await structuresService.schoolYearsService.getSchoolYears(params)
      setAnneesScolaires(response)
    }
    fetchAnneesScolaires()
  }, [debouncedSearch, statusFilter, lockFilter])

  const editingAnnee = editingId ? anneesScolaires.find(a => a.id === editingId) : null

  const handleAddAnnee = async (formData) => {
    await structuresService.schoolYearsService.createSchoolYear(formData)
    const params = {}
    if (debouncedSearch) params.search = debouncedSearch
    if (statusFilter) params.status = statusFilter.toLowerCase()
    if (lockFilter !== '') params.is_locked = lockFilter === 'true'
    
    const response = await structuresService.schoolYearsService.getSchoolYears(params)
    setAnneesScolaires(response)
    toast.success('Année scolaire ajoutée avec succès')
  }
  
  const handleEditAnnee = async (formData) => {
    const updated = await structuresService.schoolYearsService.updateSchoolYear(editingId, formData)
    // Mettre à jour localement sans recharger toute la liste
    setAnneesScolaires(anneesScolaires.map(a => a.id === editingId ? updated : a))
    setEditingId(null)
    toast.success('Année scolaire modifiée avec succès')
  }

  const handleToggleLock = async (id) => {
    try {
      const updated = await structuresService.schoolYearsService.toggleLockSchoolYear(id)
      // Mettre à jour localement
      setAnneesScolaires(anneesScolaires.map(a => a.id === id ? updated : a))
    } catch (error) {
      toast.error(extractDRFError(error))
    }
  }

  const handleDeleteAnnee = async (id) => {
    try{
      await structuresService.schoolYearsService.deleteSchoolYear(id)
      // Recharger la liste avec les filtres actuels
      const params = {}
      if (debouncedSearch) params.search = debouncedSearch
      if (statusFilter) params.status = statusFilter.toLowerCase()
      if (lockFilter !== '') params.is_locked = lockFilter === 'true'
      
      const response = await structuresService.schoolYearsService.getSchoolYears(params)
      setAnneesScolaires(response)
      toast.success('Année scolaire supprimée avec succès')
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

  const handleGoToFirstPeriod = async (id) => {
    try {
      const updated = await structuresService.schoolYearsService.goToFisrtPeriod(id)
      // Mettre à jour localement
      setAnneesScolaires(anneesScolaires.map(a => 
        a.id === id ? updated : a
      ))
      toast.success('Passage à la première période effectué')
    } catch (error) {
      toast.error(extractDRFError(error))
    }
  }

  const handleGoToSecondPeriod = async (id) => {
    try {
      const updated = await structuresService.schoolYearsService.goToSecondPeriod(id)
      // Mettre à jour localement
      setAnneesScolaires(anneesScolaires.map(a => 
        a.id === id ? updated : a
      ))
      toast.success('Passage à la deuxième période effectué')
    } catch (error) {
      toast.error(extractDRFError(error))
    }
  }

  const handleActivateSchoolYear = async (id) => {
    try {     
      // Mettre à jour localement
      const schoolYear = await structuresService.schoolYearsService.activateSchoolYear(id)
      setAnneesScolaires(anneesScolaires.map(a => 
        a.id === id ? schoolYear : a
      ))
      toast.success('Année scolaire activée avec succès')
    } catch (error) {
      toast.error(extractDRFError(error))
    }
  }

  const handleEndSchoolYear = async (id) => {
    try {
      const ended = await structuresService.schoolYearsService.endSchoolYear(id)
      // Mettre à jour localement
      setAnneesScolaires(anneesScolaires.map(a => 
        a.id === id ? ended : a
      ))
      toast.success('Année scolaire clôturée avec succès')
    } catch (error) {
      toast.error(extractDRFError(error))
    }
  }

  const openEndConfirmModal = (id) => {
    setEndId(id)
    setEndConfirmModal(true)
    setOpenMenuId(null)
  }

  const closeEndConfirmModal = () => {
    setEndId(null)
    setEndConfirmModal(false)
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
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              placeholder="Rechercher une année scolaire…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white w-full sm:w-56"
            />
            <Button onClick={openAddModal}>+ Ajouter</Button>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">Statut:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
              >
                <option value="">Tous</option>
                <option value="ACTIVE">Actif</option>
                <option value="UPCOMING">À venir</option>
                <option value="CLOSED">Clôturé</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">Verrouillage:</label>
              <select
                value={lockFilter}
                onChange={(e) => setLockFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
              >
                <option value="">Tous</option>
                <option value="false">Déverrouillé</option>
                <option value="true">Verrouillé</option>
              </select>
            </div>
            
            <button
              onClick={() => {
                setSearch('')
                setStatusFilter('')
                setLockFilter('')
              }}
              disabled={!search && !statusFilter && !lockFilter}
              className={`px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none transition-colors ${
                (search || statusFilter || lockFilter)
                  ? 'text-slate-600 hover:bg-slate-50 cursor-pointer' 
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {anneesScolaires.length === 0 && debouncedSearch === "" ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500">
                Aucune année scolaire disponible.
              </p>
            </div>
          ) : anneesScolaires.length === 0 && debouncedSearch !== "" ? (
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
                    <th className="text-left pb-3 font-medium">Label</th>
                    <th className="text-center pb-3 font-medium">Verrouillage</th>
                    <th className="text-center pb-3 font-medium">Statut</th>
                    <th className="text-center pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {anneesScolaires.map((annee) => (
                    <tr key={annee.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 pl-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-medium text-slate-800">{annee.id}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-400 font-mono">{annee.label}</td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleToggleLock(annee.id)}
                          className="p-1 rounded hover:bg-slate-100 transition-colors"
                          title={annee.is_locked ? 'Déverrouiller' : 'Verrouiller'}
                        >
                          {annee.is_locked ? (
                            // 🔒 Cadenas fermé
                            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                              <path strokeLinecap="round" d="M8 11V7a4 4 0 018 0v4" />
                            </svg>
                          ) : (
                            // 🔓 Cadenas ouvert
                            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                              <path strokeLinecap="round" d="M8 11V7a4 4 0 017.9-1" />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td className="py-3 text-center">
                        {mapStatusToPill(annee)}
                      </td>
                      <td className="py-3 text-center">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === annee.id ? null : annee.id)}
                            className="px-3 py-1 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded transition"
                          >
                            ⋮
                          </button>
                          
                          {openMenuId === annee.id && (
                            <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                              <button
                                onClick={() => {
                                  openEditModal(annee.id)
                                  setOpenMenuId(null)
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition first:rounded-t-lg"
                              >
                                Modifier
                              </button>
                              
                              {annee.status === 'ACTIVE' && (
                                <>
                                  {annee.period !== 'FIRST' && (
                                    <button
                                      onClick={() => {
                                        handleGoToFirstPeriod(annee.id)
                                        setOpenMenuId(null)
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition border-t border-slate-200"
                                    >
                                      1ère période
                                    </button>
                                  )}
                                  {annee.period !== 'SECONDE' && (
                                    <button
                                      onClick={() => {
                                        handleGoToSecondPeriod(annee.id)
                                        setOpenMenuId(null)
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition border-t border-slate-200"
                                    >
                                      2ème période
                                    </button>
                                  )}
                                </>
                              )}
                              {annee.status === 'UPCOMING' && (
                                <button
                                  onClick={() => {
                                    handleActivateSchoolYear(annee.id)
                                    setOpenMenuId(null)
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition border-t border-slate-200"
                                >
                                  Activer
                                </button>
                              )}
                              
                              {annee.status === 'ACTIVE' && (
                                <button
                                  onClick={() => {
                                    openEndConfirmModal(annee.id)
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 transition border-t border-slate-200"
                                >
                                  Clôturer
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  if (annee.is_locked) {
                                    toast.error("Impossible de supprimer une année scolaire verrouillée")
                                    return
                                  }
                                  openDeleteConfirmModal(annee.id)
                                }}
                                className={`block w-full text-left px-4 py-2 text-sm transition last:rounded-b-lg border-t border-slate-200 ${
                                  annee.is_locked 
                                    ? 'text-slate-400 cursor-not-allowed' 
                                    : 'text-red-600 hover:bg-red-50'
                                }`}
                              >
                                Supprimer {annee.is_locked && '(verrouillé)'}
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

      {/* Modal de confirmation pour la suppression */}
      <ConfirmModal
        isOpen={deleteConfirmModal}
        onClose={closeDeleteConfirmModal}
        onConfirm={() => handleDeleteAnnee(deleteId)}
        title="Supprimer l'année scolaire"
        message="Êtes-vous sûr de vouloir supprimer cette année scolaire ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      {/* Modal de confirmation pour la clôture */}
      <ConfirmModal
        isOpen={endConfirmModal}
        onClose={closeEndConfirmModal}
        onConfirm={() => handleEndSchoolYear(endId)}
        title="Clôturer l'année scolaire"
        message="Êtes-vous sûr de vouloir clôturer cette année scolaire ? Cette action est irréversible."
        confirmText="Clôturer"
        cancelText="Annuler"
        type="warning"
      />
    </div>
  )
}
