import { useState, useEffect } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/Modal'
import structuresService from '../../../services/structuresService'
import { toast } from 'react-toastify'
import extractDRFError from '../../../utils/extractError'
import ConfirmModal from '../../../components/ConfirmModal'

// Composant de formulaire pour ajouter une UE
function AddUEForm({ onClose, onSubmit ,editingItem = null,isEditing = false}) {
  const [formData, setFormData] = useState({
    code: '',
    label: '',
    formation: '',
    semester: '',
    is_active: true,
  })
  const [formations, setFormations] = useState([])
  const [semester, setSemester] = useState([])
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  useEffect(() => {
    if (isEditing && editingItem) {
      const fetchUE = async () => {
        try {
          setFormData({
            code: editingItem.code,
            label: editingItem.label,
            formation: editingItem.formation.id,
            semester: editingItem.semester.id,
            is_active: editingItem.is_active !== undefined ? editingItem.is_active : true
          })
        } catch (error) {
          toast.error(extractDRFError(error))
        }
      }
      fetchUE()
    }
  }, [isEditing, editingItem])

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await structuresService.FormationService.getFormations()
        setFormations(response)
      } catch (error) {
        toast.error(extractDRFError(error))
      }
    }
    fetchFormations()
  }, [])

  useEffect(() => {
    const fetchNiveaux = async () => {
      if (!formData.formation) {
        setSemester([])
        return
      }
      try {
        const response = await structuresService.SemesterService.getSemesters({formation: formData.formation})
        setSemester(response)
      } catch (error) {
        toast.error(extractDRFError(error))
        setSemester([])
      }
    }
    fetchNiveaux()
  }, [formData.formation])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.code.trim() || !formData.label.trim() || !formData.formation || !formData.semester) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      const data = {
        code: formData.code.trim(),
        label: formData.label.trim(),
        formation: formData.formation,
        semester: formData.semester,
        is_active: formData.is_active
      }
      await onSubmit(data)
      onClose()
    } catch (error) {
      toast.error(extractDRFError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Code *
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Ex: EA-301"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Nom de l'UE *
        </label>
        <input
          type="text"
          name="label"
          value={formData.label}
          onChange={handleChange}
          placeholder="Ex: Électronique Analogique"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Formation *
        </label>
        <select
          name="formation"
          onChange={(e) => setFormData(prev => ({
            ...prev,
            formation: e.target.value
          }))}
          value={formData.formation}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        >
          <option value="">Sélectionner une formation</option>
          {formations && formations.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Semester *
        </label>
        <select
          name="semester"
          onChange={(e) => setFormData(prev => ({
            ...prev,
            semester: e.target.value
          }))}
          value={formData.semester}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        >
          <option value="">Sélectionner un semester</option>
          {semester && semester.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({...prev, is_active: e.target.checked}))}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-slate-700">Unité d'enseignement active</span>
        </label>
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
          disabled={loading}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Création...' : 'Créer l\'UE'}
        </button>
      </div>
    </form>
  )
}

export default function UEColumn({ selectedItem, onSelectItem }) {
  const [ues, setUes] = useState([])

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [formationFilter, setFormationFilter] = useState("")
  const [semesterFilter, setSemesterFilter] = useState("")
  const [formations,setFormations] = useState([])
  const [semesters,setSemester] = useState([])
  const [statusFilter,setStatusFilter] = useState(true)
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen,setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen,setIsDeleteModalOpen] = useState(false)

  const [actionItem,setActionItem] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  const loadUEs = async () => {
    const filters = {}
    if (debouncedSearch) filters.search = debouncedSearch
    if (formationFilter) filters.formation = formationFilter
    if (semesterFilter) filters.semester = semesterFilter
    if (statusFilter !== "") filters.is_active = statusFilter
    
    try {
      const response = await structuresService.courseUnitService.getCourseUnits(filters)
      setUes(response)
    } catch (error) {
      toast.error("erreur lors du chargement")
      console.log(extractDRFError(error))
    }
  }

  const loadFormations = async () => {
    const response = await structuresService.FormationService.getFormations()
    setFormations(response)
  }

  const loadSemesters = async (formation) => {
    const response = await structuresService.SemesterService.getSemesters({formation})
    setSemester(response)
  }
  
  useEffect(() => {loadFormations()},[])
  useEffect(() => {loadSemesters(formationFilter)},[formationFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.ue-menu-container')) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  useEffect(() => {
    const handleCourseModuleEvent = (event) => {
      const { action, courseUnitId } = event.detail
      
      // Recharger les UEs si l'événement concerne une UE spécifique
      if (action && courseUnitId) {
        loadUEs()
      }
    }

    document.addEventListener('courseModuleChanged', handleCourseModuleEvent)
    return () => document.removeEventListener('courseModuleChanged', handleCourseModuleEvent)
  }, [])

  useEffect(() => {
    loadUEs()
  }, [debouncedSearch,formationFilter,semesterFilter,statusFilter])

  const handleAddUe = async (formData) => {
    try {
      await structuresService.courseUnitService.createCourseUnit(formData)
      loadUEs()
      toast.success('Unité d\'enseignement créée avec succès')
    } catch (error) {
      toast.error("Erreur lors de l'ajout de l\'unité d\'enseignement")
    }
  }

  const handleEditUe = async (formData) => {
    try {
      await structuresService.courseUnitService.updateCourseUnit(actionItem.id, formData)
      loadUEs()
      toast.success('Unité d\'enseignement modifiée avec succès')
    } catch (error) {
      toast.error('Erreur lors de la modification de l\'unité d\'enseignement')
    }
  }

  const handleDeleteUe = async () => {
    try {
      await structuresService.courseUnitService.deleteCourseUnit(actionItem.id)
      loadUEs()
      toast.success('Unité d\'enseignement supprimée avec succès')
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'unité d\'enseignement')
    }
  }

  const handleToggleUEActivation = async (id,is_active) => {
    try{
      await structuresService.courseUnitService.updateCourseUnit(id,{is_active:!is_active})
      loadUEs()
      toast.success("ok")
    }catch(error){
      toast.error("erreur lors de la modification du cours")
      console.log(error)
    }
  }

  return (
    <div className="flex-1 min-w-0 border-r border-slate-200 last:border-r-0">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm text-slate-700">Unités d'Enseignement</h3>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            variant="outline"
            className="text-xs px-2 py-1 h-7"
          >
            + Ajouter
          </Button>
        </div>
        {/* recherche ici */}
        <input
          type="text"
          placeholder="Rechercher une UE..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
        />
        {/* filtrage ici */}        
        <div className="flex items-center gap-2 mt-2">
          {/* formation */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">formation:</label>
            <select
              value={formationFilter}
              onChange={(e) => setFormationFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
            >
              <option value="">Tous</option>
              {formations.map((formation) => (
                <option key={formation.id} value={formation.id}>
                  {formation.code}
                </option>
              ))}
            </select>
          </div>
          {/* semestre */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">semestre:</label>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
            >
              <option value="">Tous</option>
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.code}
                </option>
              ))}
            </select>
          </div>

          {/* statut */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">statut:</label>
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
              setFormationFilter('');
              setSemesterFilter('')
            }}
            disabled={!search && formationFilter === "" && semesterFilter === ""}
            className={`px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none transition-colors ${
              search || formationFilter !== "" || semesterFilter !== ""
                ? 'text-slate-600 hover:bg-slate-50 cursor-pointer' 
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <div className="p-2 h-96 overflow-y-auto">
        {ues.length === 0 ? (
          <p className="text-xs text-slate-500">Aucune UE trouvée</p>
        ) : (
          ues.map((ue) => (
            <div
              key={ue.id}
              className="relative ue-menu-container"
            >
              <button
                onClick={() => {
                  onSelectItem(ue)
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-1 ${
                  selectedItem?.id === ue.id
                    ? 'bg-blue-100 text-blue-800 border border-blue-200 font-medium'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-medium">{ue.label || ue.nom}</div>
                  {ue.code && (
                    <span className="text-xs opacity-75 font-mono bg-slate-100 px-1 py-0.5 rounded">{ue.code}</span>
                  )}
                  {ue.formation && (
                    <span className="text-xs opacity-75 bg-blue-100 px-1 py-0.5 rounded">F: {ue.formation.code}</span>
                  )}
                  {ue.semester && (
                    <span className="text-xs opacity-75 bg-green-100 px-1 py-0.5 rounded">S: {ue.semester.code}</span>
                  )}
                  {ue.total_credits !== undefined && ue.total_credits !== null && (
                    <span className="text-xs opacity-75 bg-blue-100 px-1 py-0.5 rounded">{ue.total_credits} crédits</span>
                  )}
                  {(ue.is_active == true || ue.is_active == false) && (
                    <span className={`text-xs opacity-75 px-1 py-0.5 rounded ${ue.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{ue.is_active? "active":"inactive"}</span>                    
                  )}
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (openMenuId === ue.id) {
                    setOpenMenuId(null)
                  } else {
                    setOpenMenuId(ue.id)
                  }
                }}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                title="Actions"
              >
                ⋮
              </button>
              {/* menu flottant */}
              {openMenuId === ue.id && (
                <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg z-10 w-[120px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActionItem(ue)
                      setIsEditModalOpen(true)
                      setOpenMenuId(null)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      handleToggleUEActivation(ue.id,ue.is_active)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50"
                  >
                    {!ue.is_active?'Activer':'Desactiver'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActionItem(ue)
                      setIsDeleteModalOpen(true)
                      setOpenMenuId(null)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Ajouter une Unité d'Enseignement
          </h3>
          <AddUEForm onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddUe}/>
        </Modal>
      )}
      {
        isEditModalOpen && (
          <Modal isOpen={isEditModalOpen} onClose={() => {setIsEditModalOpen(false); setActionItem(null)}}>
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Modifier une Unité d'Enseignement
            </h3>
            <AddUEForm onClose={() => {setIsEditModalOpen(false); setActionItem(null)}} onSubmit={handleEditUe} editingItem={actionItem} isEditing={true}/>
          </Modal>
        )
      }
      {
        isDeleteModalOpen && (
          <ConfirmModal 
            isOpen={isDeleteModalOpen} 
            onClose={() => {setIsDeleteModalOpen(false); setActionItem(null)}} 
            onConfirm={handleDeleteUe}
            title="Supprimer l'Unité d'Enseignement"
            message="Êtes-vous sûr de vouloir supprimer cette Unité d'Enseignement ?"
          />
        )
      }
    </div>
  )
}
