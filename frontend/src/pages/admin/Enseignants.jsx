import { useState, useEffect } from "react"
import Button from "../../components/ui/Button"
import Pill from "../../components/ui/Pill"
import Card from "../../components/ui/Card"
import Modal from "../../components/Modal"
import ConfirmModal from "../../components/ConfirmModal"
import Avatar from "../../components/ui/Avatar"
import teacherService from "../../services/teacherService"
import extractDRFError from "../../utils/extractError"
import { toast } from "react-toastify"

function FormulaireAjoutEnseignant({ onClose, onSubmit }) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation côté client
    if (!email.trim()) {
      toast.error('L\'email est requis')
      return
    }
    
    if (!firstName.trim()) {
      toast.error('Le prénom est requis')
      return
    }
    
    if (!lastName.trim()) {
      toast.error('Le nom est requis')
      return
    }
    
    const data = {
      email: email.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role: 'TEACHER'
    }
    try{
      await onSubmit(data)
      // Réinitialiser le formulaire après succès
      setEmail('')
      setFirstName('')
      setLastName('')
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
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ex: enseignant@espa.mg"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Prénom
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ex: Jean"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nom
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Ex: Dupont"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
            required
          />
        </div>
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
          Ajouter
        </button>
      </div>
    </form>
  )
}

function FormulaireModificationEnseignant({ enseignant, onClose, onSubmit }) {
  const [email, setEmail] = useState(enseignant?.email || '')
  const [firstName, setFirstName] = useState(enseignant?.first_name || '')
  const [lastName, setLastName] = useState(enseignant?.last_name || '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('L\'email est requis')
      return
    }
    
    if (!firstName.trim()) {
      toast.error('Le prénom est requis')
      return
    }
    
    if (!lastName.trim()) {
      toast.error('Le nom est requis')
      return
    }
    
    const data = {
      email: email.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    }
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
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ex: enseignant@espa.mg"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Prénom
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ex: Jean"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nom
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Ex: Dupont"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
            required
          />
        </div>
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
          Modifier
        </button>
      </div>
    </form>
  )
}

export default function Enseignants() {
  const [enseignants, setEnseignants] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [openMenuId, setOpenMenuId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    async function fetchEnseignants() {
      const params = {}
      if (debouncedSearch) params.search = debouncedSearch
      if (statusFilter) params.is_active = statusFilter === "true"
      const response = await teacherService.getTeachers(params)
      setEnseignants(response)
    }
    fetchEnseignants()
  }, [debouncedSearch, statusFilter])

  const editingEnseignant = editingId ? enseignants.find(e => e.id === editingId) : null

  const handleAddEnseignant = async (formData) => {
    await teacherService.createTeacher(formData)
    const params = {}
    if (debouncedSearch) params.search = debouncedSearch
    if (statusFilter) params.is_active = statusFilter === "true"
    
    const response = await teacherService.getTeachers(params)
    setEnseignants(response)
    toast.success('Enseignant ajouté avec succès')
  }
  
  const handleEditEnseignant = async (formData) => {
    const updated = await teacherService.updateTeacher(editingId, formData)
    // Mettre à jour localement sans recharger toute la liste
    setEnseignants(enseignants.map(e => e.id === editingId ? updated : e))
    setEditingId(null)
    toast.success('Enseignant modifié avec succès')
  }

  const handleDeleteEnseignant = async (id) => {
    try{
      await teacherService.deleteTeacher(id)
      // Recharger la liste avec les filtres actuels
      const params = {}
      if (debouncedSearch) params.search = debouncedSearch
      if (statusFilter) params.is_active = statusFilter === "true"
      
      const response = await teacherService.getTeachers(params)
      setEnseignants(response)
      toast.success('Enseignant supprimé avec succès')
    }catch(error){
      toast.error(extractDRFError(error))
    }
  }

  const handletoggleActivation = async (id) => {
    try{
      const updated = await teacherService.updateTeacher(id, {is_active: !enseignants.find(e => e.id === id).is_active})
      setEnseignants(enseignants.map(e => e.id === id ? updated : e))
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

  function renderTable(rows) {
    return (
      <div className="overflow-x-auto overflow-visible">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="text-left pb-3 pl-3 font-medium">Enseignant</th>
              <th className="text-left pb-3 font-medium">Email</th>
              <th className="text-left pb-3 font-medium">Matricule</th>
              <th className="text-left pb-3 font-medium">Statut</th>
              <th className="text-center pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((enseignant) => (
              <tr key={enseignant.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <td className="py-3 pl-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={`${enseignant.first_name} ${enseignant.last_name}`} size="sm" />
                    <div>
                      <div className="font-medium text-slate-800">
                        {enseignant.first_name && enseignant.last_name ? `${enseignant.first_name} ${enseignant.last_name}` : enseignant.username || 'Nom non disponible'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <span className="text-slate-600 text-xs">{enseignant.email}</span>
                </td>
                <td className="py-3">
                  <span className="font-mono text-slate-600 text-xs">{enseignant.username || '-'}</span>
                </td>
                <td className="py-3">
                  <Pill 
                    color={enseignant.is_active ? 'green' : 'red'}
                    label={enseignant.is_active ? 'Actif' : 'Inactif'}
                  />
                </td>
                <td className="py-3 text-center">
                  <div className="relative">
                    <button
                      aria-label="action-menu"
                      onClick={(e) => {
                        const rect = e.target.getBoundingClientRect()
                        if (openMenuId === enseignant.id) {
                          setOpenMenuId(null)
                        } else {
                          setMenuPosition({
                            top: rect.bottom + 5,
                            right: window.innerWidth - rect.right
                          })
                          setOpenMenuId(enseignant.id)
                        }
                      }}
                      className="px-3 py-1 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded transition"
                    >
                      ⋮
                    </button>
                    
                    {openMenuId === enseignant.id && (
                      <div 
                        data-menu-id={enseignant.id} 
                        className="fixed bg-white border border-slate-200 rounded-lg shadow-lg z-[9999] min-w-[160px]"
                        style={{
                          top: menuPosition.top + 'px',
                          right: menuPosition.right + 'px'
                        }}
                      >
                        <button
                          onClick={() => {
                            openEditModal(enseignant.id)
                            setOpenMenuId(null)
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition first:rounded-t-lg"
                        >
                          Modifier
                        </button>
                        
                        <button
                          onClick={() => handletoggleActivation(enseignant.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition first:rounded-t-lg"
                        >
                          {enseignant.is_active ? 'Désactiver' : 'Activer'}
                        </button>
                        
                        <button
                          onClick={() => openDeleteConfirmModal(enseignant.id)}
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
      </div>
    )
  }

  return (
    <div className="fade-in space-y-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Enseignants</h2>
        <p className="text-sm text-slate-500 mt-1">Gérer les enseignants de l'établissement</p>
      </div>

      <Card>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              placeholder="Rechercher un enseignant…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white w-full sm:w-56"
            />
            <Button onClick={openAddModal}>+ Ajouter</Button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">Statut:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
              >
                <option value="">Tous</option>
                <option value="true">Actif</option>
                <option value="false">Inactif</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
              }}
              disabled={!search && statusFilter === ""}
              className={`px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none transition-colors ${
                search || statusFilter !== ""
                  ? 'text-slate-600 hover:bg-slate-50 cursor-pointer' 
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {enseignants.length === 0 && debouncedSearch === "" && statusFilter === "" ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500">
                Aucun enseignant disponible.
              </p>
            </div>
          ) : enseignants.length === 0 && (debouncedSearch !== "" || statusFilter !== "") ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-500">
                Aucun résultat trouvé pour « {debouncedSearch} ».
              </p>
            </div>
          ) : (
            renderTable(enseignants)
          )}
        </div>
      </Card>

      {/* Modal pour ajouter un enseignant */}
      {isModalOpen && !editingId && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Ajouter un enseignant
          </h3>
          <FormulaireAjoutEnseignant
            onClose={closeModal}
            onSubmit={handleAddEnseignant}
          />
        </Modal>
      )}

      {/* Modal pour modifier un enseignant */}
      {isModalOpen && editingId && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Modifier un enseignant
          </h3>
          <FormulaireModificationEnseignant
            enseignant={editingEnseignant}
            onClose={closeModal}
            onSubmit={handleEditEnseignant}
          />
        </Modal>
      )}

      {/* Modal de confirmation pour la suppression */}
      <ConfirmModal
        isOpen={deleteConfirmModal}
        onClose={closeDeleteConfirmModal}
        onConfirm={() => handleDeleteEnseignant(deleteId)}
        title="Supprimer l'enseignant"
        message="Êtes-vous sûr de vouloir supprimer cet enseignant ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  )
}
