import { useState, useEffect } from "react"
import Button from "../../../components/ui/Button"
import Card from "../../../components/ui/Card"
import Modal from "../../../components/Modal"
import ConfirmModal from "../../../components/ConfirmModal"
import structuresService from "../../../services/structuresService"
import extractDRFError from "../../../utils/extractError"
import { toast } from "react-toastify"

function FormulaireNiveau({ niveau = null, onClose, onSubmit, isEditing = false }) {
  const [code, setCode] = useState(niveau?.code || '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation côté client
    if (!code.trim()) {
      toast.error('Le code du niveau est requis')
      return
    }
    
    const data = code.trim()
    try{
      await onSubmit(data)
      onClose()
    }catch(error){
      const errorMessage = extractDRFError(error)
      toast.error(errorMessage || 'Une erreur est survenue')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Code du niveau
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex: L1, L2, L3, M1, M2"
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

export default function NiveauTab() {
  const [niveaux, setNiveaux] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [openMenuId, setOpenMenuId] = useState(null)
  const [PopConfirmModal, setPopConfirmModal] = useState(false)


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    async function fetchNiveaux() {
      const params = {}
      if (debouncedSearch) params.search = debouncedSearch
      
      const response = await structuresService.levelService.getLevels(params)
      setNiveaux(response)
    }
    fetchNiveaux()
  }, [debouncedSearch])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId !== null) {
        const menuElement = document.querySelector(`[data-menu-id="${openMenuId}"]`)
        const actionButton = event.target.closest('button[aria-label="action-menu"]')
        
        if (menuElement && !menuElement.contains(event.target) && !actionButton) {
          setOpenMenuId(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openMenuId])

  const editingNiveau = editingId ? niveaux.find(n => n.id === editingId) : null

  const handleAddNiveau = async (formData) => {
    await structuresService.levelService.createLevel(formData)
    const params = {}
    if (debouncedSearch) params.search = debouncedSearch
    
    const response = await structuresService.levelService.getLevels(params)
    setNiveaux(response)
    toast.success('Niveau ajouté avec succès')
  }
  
  const handleEditNiveau = async (formData) => {
    const updated = await structuresService.levelService.updateLevel(editingId, {code:formData})
    // Mettre à jour localement sans recharger toute la liste
    setNiveaux(niveaux.map(n => n.id === editingId ? updated : n))
    setEditingId(null)
    toast.success('Niveau modifié avec succès')
  }

  const handlePopNiveau = async () => {
    try{
      await structuresService.levelService.popLastLevel()
      // Recharger la liste avec les filtres actuels
      const params = {}
      if (debouncedSearch) params.search = debouncedSearch
      
      const response = await structuresService.levelService.getLevels(params)
      setNiveaux(response)
      toast.success('Niveau supprimé avec succès')
    }catch(error){
      toast.error(extractDRFError(error))
    }
  }

  const openPopConfirmModal = (id) => {
    setPopConfirmModal(true)
  }

  const closePopConfirmModal = () => {
    setPopConfirmModal(false)
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
        <h2 className="text-2xl font-bold text-slate-800">Niveaux</h2>
        <p className="text-sm text-slate-500 mt-1">Gérer les niveaux académiques de l'établissement</p>
      </div>

      <Card>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              placeholder="Rechercher un niveau…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white w-full sm:w-56"
            />
            <div className="flex gap-2">
              <Button onClick={openPopConfirmModal}>- Retirer</Button>
              <Button onClick={openAddModal}>+ Ajouter</Button>
            </div>
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
          {niveaux.length === 0 && debouncedSearch === "" ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500">
                Aucun niveau disponible.
              </p>
            </div>
          ) : niveaux.length === 0 && debouncedSearch !== "" ? (
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
                    <th className="text-left pb-3 font-medium">Ordre</th>
                    <th className="text-center pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {niveaux.map((niveau) => (
                    <tr key={niveau.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 pl-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-medium text-slate-800">{niveau.id}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-slate-600 text-xs">{niveau.code}</span>
                      </td>
                      <td className="py-3">
                        <span className="font-medium text-slate-700">{niveau.order}</span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="relative">
                          <button
                            aria-label="action-menu"
                            onClick={() => {
                              if (openMenuId === niveau.id) {
                                setOpenMenuId(null)
                              } else {
                                setOpenMenuId(niveau.id)
                              }
                            }}
                            className="px-3 py-1 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded transition"
                          >
                            ⋮
                          </button>
                          
                          {openMenuId === niveau.id && (
                            <div data-menu-id={niveau.id} className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                              <button
                                onClick={() => {
                                  openEditModal(niveau.id)
                                  setOpenMenuId(null)
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition first:rounded-t-lg"
                              >
                                Modifier
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

      {/* Modal pour ajouter/modifier un niveau */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingId ? 'Modifier un niveau' : 'Ajouter un niveau'}
          </h3>
          <FormulaireNiveau
            niveau={editingNiveau}
            onClose={closeModal}
            onSubmit={editingId ? handleEditNiveau : handleAddNiveau}
            isEditing={!!editingId}
          />
        </Modal>
      )}

      {/* Modal de confirmation pour la suppression */}
      <ConfirmModal
        isOpen={PopConfirmModal}
        onClose={closePopConfirmModal}
        onConfirm={() => handlePopNiveau()}
        title="Supprimer le dernier niveau"
        message="Êtes-vous sûr de vouloir supprimer ce niveau ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  )
}
