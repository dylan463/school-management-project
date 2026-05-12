import { useState, useEffect } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/Modal'
import ConfirmModal from '../../../components/ConfirmModal'
import structuresService from '../../../services/structuresService'
import assessmentsService from '../../../services/assessmentsService'
import { toast } from 'react-toastify'
import extractDRFError from '../../../utils/extractError'

// Composant de formulaire pour ajouter/modifier un examen
function AddExamenForm({ onClose, onSubmit, selectedCours, editingItem = null, isEditing = false, selectedSchoolYear }) {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'EXAM',
    session: '',
    location: '',
    grade_weight: ''
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
        name: editingItem.name || '',
        date: editingItem.date || '',
        type: editingItem.type || 'EXAM',
        session: editingItem.session || '',
        location: editingItem.location || '',
        grade_weight: editingItem.grade_weight || ''
      })
    }
  }, [isEditing, editingItem])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.date) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      const data = {
        name: formData.name.trim(),
        date: formData.date,
        type: formData.type,
        session: formData.session,
        location: formData.location,
        grade_weight: formData.grade_weight ? parseFloat(formData.grade_weight) : null,
        course_module: selectedCours?.id ? parseInt(selectedCours.id) : null,
        school_year: selectedSchoolYear ? parseInt(selectedSchoolYear.id) : null
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
          Nom de l'examen *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: DS1 - Mathématiques"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Date *
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          >
            <option value="EXAM">Examen</option>
            <option value="QUIZ">Quiz</option>
            <option value="TP">Travaux Pratiques</option>
            <option value="ORAL">Oral</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Session
          </label>
          <select
            name="session"
            value={formData.session}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          >
            <option value="NORMAL">Normale</option>
            <option value="RETAKE">Rattrapage</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Lieu
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Ex: Salle A101"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Poids de la note
          </label>
          <input
            type="number"
            name="grade_weight"
            value={formData.grade_weight}
            onChange={handleChange}
            placeholder="Ex: 0.3"
            min="0"
            max="1"
            step="0.1"
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
          {loading ? (isEditing ? 'Modification...' : 'Création...') : (isEditing ? 'Modifier' : 'Créer l\'examen')}
        </button>
      </div>
    </form>
  )
}

export default function ExamensColumn({ selectedCours, selectedItem, onSelectItem }) {
  const [examens, setExamens] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState("")
  
  // School year filtering states
  const [schoolYearSearch, setSchoolYearSearch] = useState('')
  const [debouncedSchoolYearSearch, setDebouncedSchoolYearSearch] = useState('')
  const [schoolYears, setSchoolYears] = useState([])
  const [selectedSchoolYear, setSelectedSchoolYear] = useState(null)
  const [activeSchoolYear, setActiveSchoolYear] = useState(null)
  const [showSchoolYearDropdown, setShowSchoolYearDropdown] = useState(false)
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [actionItem, setActionItem] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  
  const [filters, setFilters] = useState({})

  // Load active school year
  const loadActiveSchoolYear = async () => {
    try {
      const response = await structuresService.schoolYearsService.getSchoolYears({ is_active: true })
      if (response.length > 0) {
        setActiveSchoolYear(response[0])
        setSelectedSchoolYear(response[0])
      }
    } catch (error) {
      console.error('Error loading active school year:', error)
    }
  }
  
  // Load school years based on search
  const loadSchoolYears = async () => {
    try {
      const response = await structuresService.schoolYearsService.searchSchoolYears({ 
        search: debouncedSchoolYearSearch 
      })
      setSchoolYears(response)
    } catch (error) {
      console.error('Error loading school years:', error)
      setSchoolYears([])
    }
  }
  
  // Load examens
  const loadExamens = async () => {
    if (!selectedCours || !selectedSchoolYear) {
      setExamens([])
      return
    }
    
    const filters = {}
    if (debouncedSearch) filters.search = debouncedSearch
    if (selectedCours) filters.course_module = selectedCours.id
    if (selectedSchoolYear) filters.school_year = selectedSchoolYear.id
    
    try {
      const response = await assessmentsService.assessmentService.getAssessments(filters)
      setExamens(response)
    } catch (error) {
      toast.error('Erreur lors du chargement des examens')
      console.error('Error loading examens:', error)
      setExamens([])
    }
  }
  
  // Handle add examen
  const handleAddExamen = async (formData) => {
    try {
      await assessmentsService.assessmentService.createAssessment(
        formData.name,
        formData.type,
        formData.session,
        formData.location,
        formData.grade_weight,
        formData.date,
        formData.course_module,
        formData.school_year
      )
      loadExamens()
      toast.success('Examen créé avec succès')
    } catch (error) {
      toast.error('Erreur lors de la création de l\'examen')
      console.error('Error creating examen:', error)
      throw error
    }
  }
  
  // Handle edit examen
  const handleEditExamen = async (formData) => {
    try {
      await assessmentsService.assessmentService.updateAssessment(actionItem.id, formData)
      loadExamens()
      toast.success('Examen modifié avec succès')
    } catch (error) {
      toast.error('Erreur lors de la modification de l\'examen')
      console.error('Error editing examen:', error)
      throw error
    }
  }
  
  // Handle delete examen
  const handleDeleteExamen = async () => {
    try {
      await assessmentsService.assessmentService.deleteAssessment(actionItem.id)
      loadExamens()
      toast.success('Examen supprimé avec succès')
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'examen')
      console.error('Error deleting examen:', error)
    }
  }
  
  // Handle school year selection
  const handleSelectSchoolYear = (schoolYear) => {
    setSelectedSchoolYear(schoolYear)
    setSchoolYearSearch('')
    setShowSchoolYearDropdown(false)
  }

  const handletogglePublish = (examen) => {
    if (!examen) return;
    if (examen.is_published) {
      assessmentsService.assessmentService.unpublishAssessment(examen.id)
    } else {
      assessmentsService.assessmentService.publishAssessment(examen.id)
    }
    loadExamens()
  }
  
  // Check if actions are allowed (only for active school year)
  const canEditOrDelete = selectedSchoolYear && activeSchoolYear && selectedSchoolYear.id === activeSchoolYear.id
  
  // Effects
  useEffect(() => {
    loadActiveSchoolYear()
  }, [])
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSchoolYearSearch(schoolYearSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [schoolYearSearch])
  
  useEffect(() => {
    if (debouncedSchoolYearSearch) {
      loadSchoolYears()
      setShowSchoolYearDropdown(true)
    } else {
      setSchoolYears([])
      setShowSchoolYearDropdown(false)
    }
  }, [debouncedSchoolYearSearch])
  
  useEffect(() => {
    loadExamens()
  }, [debouncedSearch, selectedCours, selectedSchoolYear])
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.examen-menu-container')) {
        setOpenMenuId(null)
      }
      if (showSchoolYearDropdown && !event.target.closest('.school-year-search-container')) {
        setShowSchoolYearDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId, showSchoolYearDropdown])

  return (
    <div className="flex-1 min-w-0 border-r border-slate-200 last:border-r-0">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm text-slate-700">Examens</h3>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            variant="outline"
            className="text-xs px-2 py-1 h-7"
            disabled={!selectedCours || !canEditOrDelete || !selectedCours.is_active}
          >
            + Ajouter
          </Button>
        </div>
        <input
          type="text"
          placeholder="Rechercher un examen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          disabled={!selectedCours}
        />
        
        {/* School year filtering */}
        <div className="flex items-center gap-2 mt-2">
          <label className="text-xs font-medium text-slate-600">Année scolaire:</label>
          <div className="relative school-year-search-container flex-1">
            <input
              type="text"
              placeholder="Rechercher une année scolaire..."
              value={schoolYearSearch}
              onChange={(e) => setSchoolYearSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
            />
            
            {/* Dropdown des résultats */}
            {showSchoolYearDropdown && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {schoolYears.length > 0 ? schoolYears.map((schoolYear) => (
                  <button
                    key={schoolYear.id}
                    onClick={() => handleSelectSchoolYear(schoolYear)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="font-medium text-slate-800">
                      {schoolYear.label}
                    </div>
                    {schoolYear.is_active && (
                      <div className="text-xs text-green-600">Active</div>
                    )}
                  </button>
                )) : (
                  <div className="px-3 py-2 text-xs text-slate-500">
                    Aucun résultat trouvé
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Selected school year display */}
          <div className="flex-1">
            <input
              type="text"
              value={selectedSchoolYear ? selectedSchoolYear.label : ''}
              readOnly
              placeholder="Aucune année scolaire sélectionnée"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
            />
          </div>
          
          <button
            onClick={() => {
              setSchoolYearSearch('')
              setSelectedSchoolYear(activeSchoolYear)
              setShowSchoolYearDropdown(false)
            }}
            disabled={!schoolYearSearch && selectedSchoolYear === activeSchoolYear}
            className={`px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none transition-colors ${
              schoolYearSearch || selectedSchoolYear !== activeSchoolYear
                ? 'text-slate-600 hover:bg-slate-50 cursor-pointer' 
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            Réinitialiser
          </button>
        </div>
      </div>
      
      <div className="p-2 h-96 overflow-y-auto">
        {!selectedCours ? (
          <p className="text-xs text-slate-500">Sélectionnez un cours pour voir les examens</p>
        ) : !selectedSchoolYear ? (
          <p className="text-xs text-slate-500">Sélectionnez une année scolaire pour voir les examens</p>
        ) : examens.length === 0 ? (
          <p className="text-xs text-slate-500">Aucun examen trouvé</p>
        ) : (
          examens.map((examen) => (
            <div
              key={examen.id}
              className="relative examen-menu-container"
            >
              <button
                onClick={() => onSelectItem(examen)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-1 ${
                  selectedItem?.id === examen.id
                    ? 'bg-blue-100 text-blue-800 border border-blue-200 font-medium'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-medium">{examen.name}</div>
                  {examen.type && (
                    <span className="text-xs opacity-75 font-mono bg-slate-100 px-1 py-0.5 rounded">
                      {examen.type}
                    </span>
                  )}
                  {examen.date && (
                    <span className="text-xs opacity-75 bg-blue-100 px-1 py-0.5 rounded">
                      {new Date(examen.date).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                  {examen.session && (
                    <span className="text-xs opacity-75 bg-green-100 px-1 py-0.5 rounded">
                      {examen.session}
                    </span>
                  )}
                  {examen.location && (
                    <span className="text-xs opacity-75 bg-yellow-100 px-1 py-0.5 rounded">
                      {examen.location}
                    </span>
                  )}
                  {examen.grade_weight && (
                    <span className="text-xs opacity-75 bg-purple-100 px-1 py-0.5 rounded">
                      {examen.grade_weight}
                    </span>
                  )}
                </div>
              </button>
              
              {/* Actions menu - only show for active school year */}
              {canEditOrDelete && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (openMenuId === examen.id) {
                        setOpenMenuId(null)
                      } else {
                        setOpenMenuId(examen.id)
                      }
                    }}
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    title="Actions"
                  >
                    ⋮
                  </button>
                  {openMenuId === examen.id && (
                    <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg z-10 w-[100px]">
                      <button
                        onClick={(e) => {
                          setActionItem(examen)
                          setIsEditModalOpen(true)
                          setOpenMenuId(null)
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => {
                          handletogglePublish(examen)
                          setOpenMenuId(null)
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50"
                      >
                        {examen.is_published ? 'Dépublier' : 'Publier'}
                      </button>
                      <button
                        onClick={(e) => {
                          setActionItem(examen)
                          setIsDeleteModalOpen(true)
                          setOpenMenuId(null)
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Modals */}
      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Ajouter un Examen
          </h3>
          <AddExamenForm 
            onClose={() => setIsAddModalOpen(false)} 
            onSubmit={handleAddExamen}
            selectedCours={selectedCours}
            selectedSchoolYear={selectedSchoolYear}
          />
        </Modal>
      )}
      
      {isEditModalOpen && (
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={() => {
            setIsEditModalOpen(false)
            setActionItem(null)
          }}
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Modifier un Examen
          </h3>
          <AddExamenForm 
            onClose={() => {
              setIsEditModalOpen(false)
              setActionItem(null)
            }} 
            onSubmit={handleEditExamen}
            selectedCours={selectedCours}
            selectedSchoolYear={selectedSchoolYear}
            editingItem={actionItem}
            isEditing={true}
          />
        </Modal>
      )}
      
      {isDeleteModalOpen && (
        <ConfirmModal 
          isOpen={isDeleteModalOpen} 
          onClose={() => {
            setIsDeleteModalOpen(false)
            setActionItem(null)
          }} 
          onConfirm={handleDeleteExamen}
          title="Supprimer l'Examen"
          message="Êtes-vous sûr de vouloir supprimer cet examen ?"
        />
      )}
    </div>
  )
}
