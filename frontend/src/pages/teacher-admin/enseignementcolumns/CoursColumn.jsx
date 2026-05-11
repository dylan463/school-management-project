import { useState, useEffect } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/Modal'
import ConfirmModal from '../../../components/ConfirmModal'
import structuresService from '../../../services/structuresService'
import teacherService from '../../../services/teacherService'
import { toast } from 'react-toastify'
import extractDRFError from '../../../utils/extractError'

// Composant de formulaire pour ajouter/modifier un cours
function AddCoursForm({ onClose, onSubmit, selectedUE, editingItem = null, isEditing = false }) {
  const [formData, setFormData] = useState({
    code: '',
    label: '',
    volume_hours: '',
    credits: '',
    min_val_score: 10
  })
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
      setFormData({
        code: editingItem.code || '',
        label: editingItem.label || '',
        volume_hours: editingItem.volume_hours || '',
        credits: editingItem.credits || '',
        min_val_score: editingItem.min_val_score || 10
      })
    }
  }, [isEditing, editingItem])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.code.trim() || !formData.label.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      const data = {
        code: formData.code.trim(),
        label: formData.label.trim(),
        credits: formData.credits ? parseInt(formData.credits) : null,
        min_val_score: formData.min_val_score ? parseInt(formData.min_val_score) : null,
        course_unit: selectedUE?.id ? parseInt(selectedUE.id) : null,
        volume_hours: formData.volume_hours ? parseInt(formData.volume_hours) : null,
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
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Code *
        </label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          placeholder="Ex: MATH-301"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Nom du cours *
        </label>
        <input
          type="text"
          name="label"
          value={formData.label}
          onChange={handleChange}
          placeholder="Ex: Mathématiques Avancées"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          note minimale de validation *
        </label>
        <input
          type="number"
          name="min_val_score"
          value={formData.min_val_score}
          onChange={handleChange}
          placeholder="Ex: 10"
          min="1"
          max="20"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Volume horaire
          </label>
          <input
            type="number"
            name="volume_hours"
            value={formData.volume_hours}
            onChange={handleChange}
            placeholder="Ex: 30"
            min="1"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Crédits
          </label>
          <input
            type="number"
            name="credits"
            value={formData.credits}
            onChange={handleChange}
            placeholder="Ex: 3"
            min="0"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
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
          disabled={loading}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (isEditing ? 'Modification...' : 'Création...') : (isEditing ? 'Modifier' : 'Créer le cours')}
        </button>
      </div>
    </form>
  )
}

// Composant de modal pour gérer l'assignation d'enseignant
function TeacherAssignmentModal({ onClose, course, onSubmit }) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)

  useEffect(() => {
    if (course.teacher) {
      setSelectedTeacher(course.teacher)
    }
  }, [course])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.teacher-search-container')) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  useEffect(() => {
    if (debouncedSearch) {
      searchTeachers()
    } else {
      setSearchResults([])
      setShowDropdown(false)
    }
  }, [debouncedSearch])

  const searchTeachers = async () => {
    if (!debouncedSearch.trim()) return
    
    setLoading(true)
    try {
      const response = await teacherService.searchTeachers({ 
        search: debouncedSearch,
        limit: 5
      })
      console.log(response)
      setShowDropdown(true)
      setSearchResults(response)
    } catch (error) {
      console.error('Erreur lors de la recherche d\'enseignants:', error)
      setSearchResults([])
      setShowDropdown(false)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher)
    setSearch('')
    setSearchResults([])
    setShowDropdown(false)
  }

  const handleRemoveTeacher = () => {
    setSelectedTeacher(null)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800">
        Gérer l'enseignant - {course.label}
      </h3>
      
      {/* Enseignant actuel */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Enseignant actuel
        </label>
        <div className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
          {selectedTeacher ? 
            `${selectedTeacher.first_name} ${selectedTeacher.last_name}` : 
            'Aucun enseignant assigné'
          }
        </div>
      </div>

      {/* Recherche d'enseignant */}
      <div className="relative teacher-search-container">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Rechercher un enseignant
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tapez le nom de l'enseignant..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
        />
        
        {/* Dropdown des résultats */}
        {showDropdown && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.length>0 ? searchResults.map((teacher) => (
              <button
                key={teacher.id}
                onClick={() => handleSelectTeacher(teacher)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 border-b border-slate-100 last:border-b-0"
              >
                <div className="font-medium text-slate-800">
                  {teacher.first_name} {teacher.last_name}
                </div>
                {teacher.email && (
                  <div className="text-xs text-slate-500">{teacher.email}</div>
                )}
              </button>
            )) : (
              <div className="px-3 py-2 text-sm text-slate-500">
                Aucun résultat trouvé
              </div>
            )}
          </div>
        )}
        
        {loading && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm text-slate-500">
            Recherche en cours...
          </div>
        )}
      </div>

      {/* Bouton pour retirer l'enseignant */}
      {course.teacher && (
        <button
          onClick={handleRemoveTeacher}
          className="w-full px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
        >
          Retirer l'enseignant actuel
        </button>
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
          type="button"
          onClick={() => {
            onSubmit(course.id, selectedTeacher)
          }}
          className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
        >
          Confirmer
        </button>
      </div>
    </div>
  )
}

export default function CoursColumn({ selectedUE, selectedItem, onSelectItem}) {
  const [cours, setCours] = useState([])

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [formationFilter, setFormationFilter] = useState("")
  const [semesterFilter, setSemesterFilter] = useState("")
  const [UEFilter,setUEFilter] =  useState("selected")
  const [statusFilter,setStatusFilter] = useState("true")
  const [formations,setFormations] = useState([])
  const [semesters,setSemester] = useState([])
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false)

  const [actionItem, setActionItem] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  const loadCours = async () => {
    const filters = {}
    if (debouncedSearch) filters.search = debouncedSearch
    if (selectedUE && UEFilter==="selected") filters.course_unit = selectedUE.id
    if (formationFilter) filters.formation = formationFilter
    if (semesterFilter) filters.semester = semesterFilter
    if (statusFilter === "true") filters.is_active = true
    if (statusFilter === "false") filters.is_active = false

    try {
      const response = await structuresService.courseModuleService.getCourseModules(filters)
      setCours(response)
    } catch (error) {
      toast.error("Erreur lors du chargement des cours")
      console.log("Error:", extractDRFError(error))
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
      if (openMenuId && !event.target.closest('.cours-menu-container')) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  useEffect(() => {
    loadCours()
  }, [debouncedSearch, selectedUE,UEFilter,formationFilter,semesterFilter,statusFilter])

  useEffect(() => {
    const handleCourseUnitChanged = (event) => {
      console.log("toggleUE reçu", event.detail)
      loadCours()
    }

    document.addEventListener('toggleUE', handleCourseUnitChanged)

    return () => {
      document.removeEventListener('toggleUE', handleCourseUnitChanged)
    }
  }, [loadCours])

  const handleAddCours = async (formData) => {
    try {
      await structuresService.courseModuleService.createCourseModule(formData)
      onSelectItem(null)
      loadCours()
      const event = new CustomEvent('courseModuleChanged', {
        detail: { 
          action: 'added', 
          courseUnitId: selectedUE?.id 
        }
      })
      document.dispatchEvent(event)
      toast.success('Cours créé avec succès')
    } catch (error) {
      toast.error("Erreur lors de la création du cours")
    }
  }

  const handleEditCours = async (formData) => {
    try {
      await structuresService.courseModuleService.updateCourseModule(actionItem.id, formData)
      loadCours()
      const event = new CustomEvent('courseModuleChanged', {
        detail: { 
          action: 'edited', 
          courseUnitId: selectedUE?.id 
        }
      })
      document.dispatchEvent(event)
      
      toast.success('Cours modifié avec succès')
    } catch (error) {
      toast.error('Erreur lors de la modification du cours')
    }
  }

  const handleToggleCoursActivation = async (id,is_active) => {
    try{

      await structuresService.courseModuleService.updateCourseModule(id,{is_active:!is_active})
      onSelectItem(null)
      loadCours()
      const event = new CustomEvent('courseModuleChanged', {
        detail: { 
          action: 'toggleCourse', 
          courseUnitId: selectedUE?.id 
        }
      })
      document.dispatchEvent(event)
  
      toast.success("ok")
    }catch(error){
      toast.error("erreur lors de la modification du cours")
      console.log(error)
    }
  } 

  const handleDeleteCours = async () => {
    try {
      await structuresService.courseModuleService.deleteCourseModule(actionItem.id)
      loadCours()
      onSelectItem(null)
      
      // Émettre un événement pour notifier UEColumn
      const event = new CustomEvent('courseModuleChanged', {
        detail: { 
          action: 'deleted', 
          courseUnitId: selectedUE?.id 
        }
      })
      document.dispatchEvent(event)
      
      toast.success('Cours supprimé avec succès')
    } catch (error) {
      toast.error('Erreur lors de la suppression du cours')
    }
  }

  const handleUpdateTeacher = async (courseId, teacher) => {
    try {
      await structuresService.courseModuleService.updateCourseModule(courseId, {teacher: teacher?.id || null})
      loadCours()
      setActionItem(null)
      onSelectItem(null)
      setIsTeacherModalOpen(false)
      toast.success('Enseignant modifié avec succès')
    } catch (error) {
      toast.error('Erreur lors de la modification de l\'enseignant')
      console.error('Erreur assignment:', error)
    }
  }


  return (
    <div className="flex-1 min-w-0 border-r border-slate-200 last:border-r-0">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm text-slate-700">Cours</h3>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            variant="outline"
            className="text-xs px-2 py-1 h-7"
            disabled={!selectedUE}
          >
            + Ajouter
          </Button>
        </div>
        <input
          type="text"
          placeholder="Rechercher un cours..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
        />
        {/* {filtrage ici */}        
        <div className="flex items-center gap-2 mt-2">
          {/* UE */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">UE:</label>
            <select
              value={UEFilter}
              onChange={(e) => setUEFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
            >
              <option value="selected">Sélétionnée</option>
              <option value="">Tous</option>
            </select>
          </div>
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
          {/* status */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">Status:</label>
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
              setSemesterFilter('');
              setStatusFilter("true")
              setUEFilter("selected")
            }}
            disabled={!search && formationFilter === "" && semesterFilter === "" && UEFilter === "selected" && statusFilter === "true"}
            className={`px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none transition-colors ${
              search || formationFilter || semesterFilter || UEFilter === "" || statusFilter !== "true"
                ? 'text-slate-600 hover:bg-slate-50 cursor-pointer' 
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            Réinitialiser
          </button>
        </div>
      </div>
      <div className="p-2 h-96 overflow-y-auto">
        {!selectedUE && UEFilter === "selected"? (
          <p className="text-xs text-slate-500">Sélectionnez une UE pour voir les cours</p>
        ) : cours.length === 0 ? (
          <p className="text-xs text-slate-500">Aucun cours trouvé</p>
        ) : (
          cours.map((cour) => (
            <div
              key={cour.id}
              className="relative cours-menu-container"
            >
              <button
                onClick={() => onSelectItem(cour)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-1 ${
                  selectedItem?.id === cour.id
                    ? 'bg-blue-100 text-blue-800 border border-blue-200 font-medium'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-medium">{cour.label || cour.nom}</div>
                  {cour.code && (
                    <span className="text-xs opacity-75 font-mono bg-slate-100 px-1 py-0.5 rounded">{cour.code}</span>
                  )}
                  {cour.volume_hours && (
                    <span className="text-xs opacity-75 bg-green-100 px-1 py-0.5 rounded">{cour.volume_hours}h</span>
                  )}
                  {cour.credits && (
                    <span className="text-xs opacity-75 bg-blue-100 px-1 py-0.5 rounded">{cour.credits} crédits</span>
                  )}
                  {cour.teacher && (
                    <span className="text-xs opacity-75 bg-green-100 px-1 py-0.5 rounded text-green-700">Enseignant: {cour.teacher.first_name} {cour.teacher.last_name}</span>
                  )}
                  {cour.is_active !== undefined && (
                    <span className={`text-xs opacity-75 px-1 py-0.5 rounded ${cour.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {cour.is_active ? "actif" : "inactif"}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (openMenuId === cour.id) {
                    setOpenMenuId(null)
                  } else {
                    setOpenMenuId(cour.id)
                  }
                }}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                title="Actions"
              >
                ⋮
              </button>
              {openMenuId === cour.id && (
                <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg z-10 w-[120px]">
                  <button
                    onClick={(e) => {
                      setActionItem(cour)
                      setIsEditModalOpen(true)
                      setOpenMenuId(null)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setActionItem(cour)
                      setIsTeacherModalOpen(true)
                      setOpenMenuId(null)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50"
                  >
                    Enseignant
                  </button>
                  <button
                    onClick={() => {
                      handleToggleCoursActivation(cour.id,cour.is_active)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50"
                  >
                    {cour.is_active ? "Désactiver" : "Activer"}
                  </button>
                  <button
                    onClick={(e) => {
                      setActionItem(cour)
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
            Ajouter un Cours
          </h3>
          <AddCoursForm 
            onClose={() => setIsAddModalOpen(false)} 
            onSubmit={handleAddCours}
            selectedUE={selectedUE}
          />
        </Modal>
      )}
      {isEditModalOpen && (
        <Modal isOpen={isEditModalOpen} onClose={() => {setIsEditModalOpen(false); setActionItem(null)}}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Modifier un Cours
          </h3>
          <AddCoursForm 
            onClose={() => {setIsEditModalOpen(false); setActionItem(null)}} 
            onSubmit={handleEditCours}
            selectedUE={selectedUE}
            editingItem={actionItem}
            isEditing={true}
          />
        </Modal>
      )}
      {isDeleteModalOpen && (
        <ConfirmModal 
          isOpen={isDeleteModalOpen} 
          onClose={() => {setIsDeleteModalOpen(false); setActionItem(null)}} 
          onConfirm={handleDeleteCours}
          title="Supprimer le Cours"
          message="Êtes-vous sûr de vouloir supprimer ce cours ?"
        />
      )}
      {isTeacherModalOpen && (
        <Modal 
          isOpen={isTeacherModalOpen} 
          onClose={() => {setIsTeacherModalOpen(false); setActionItem(null)}}
        >
          <TeacherAssignmentModal
            onClose={() => {setIsTeacherModalOpen(false); setActionItem(null)}}
            course={actionItem}
            onSubmit={handleUpdateTeacher}
          />
        </Modal>
      )}
    </div>
  )
}
