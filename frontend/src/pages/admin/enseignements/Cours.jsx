import { useState, useEffect } from 'react'
import Modal from '../../../components/Modal'
import ConfirmModal from '../../../components/ConfirmModal'
import teacherService from '../../../services/teacherService'
import { toast } from 'react-toastify'
import extractDRFError from '../../../utils/extractError'

// Composant de formulaire pour ajouter/modifier un cours
function AddCoursForm({ onClose, onSubmit, selectedUe, AcitonItem }) {
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
    if (AcitonItem) {
      setFormData({
        code: AcitonItem.code || '',
        label: AcitonItem.label || '',
        volume_hours: AcitonItem.volume_hours || '',
        credits: AcitonItem.credits || '',
        min_val_score: AcitonItem.min_val_score || 10
      })
    }
  }, [AcitonItem])

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
        course_unit: selectedUe?.id ? parseInt(selectedUe.id) : null,
        volume_hours: formData.volume_hours ? parseInt(formData.volume_hours) : null,
      }
      if (!data.course_unit) delete data.course_unit
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
          {loading ? (AcitonItem ? 'Modification...' : 'Création...') : (AcitonItem ? 'Modifier' : 'Créer le cours')}
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

  const handleSubmit = async () => {
    await onSubmit(course,selectedTeacher)
    onClose()
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
            {searchResults.length > 0 ? searchResults.map((teacher) => (
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
      {selectedTeacher && (
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
          onClick={handleSubmit}
          className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
        >
          Confirmer
        </button>
      </div>
    </div>
  )
}


export function CourModals({
  selectedUe,
  ActionItem,
  addModal,
  editModal,
  deleteModal,
  teacherModal,
  addOnClose,
  editOnClose,
  teacherOnClose,
  deleteOnClose,
  addOnSubmit,
  editOnSubmit,
  teacherOnSubmit,
  deleteOnConfirm,
}) {

  return (
    <div>
      {addModal && (
        <Modal isOpen={addModal} onClose={addOnClose}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Ajouter un Cours
          </h3>
          <AddCoursForm
            onClose={addOnClose}
            onSubmit={addOnSubmit}
            selectedUe={selectedUe}
          />
        </Modal>
      )}
      {editModal && (
        <Modal isOpen={editModal} onClose={editOnClose}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Modifier un Cours
          </h3>
          <AddCoursForm
            onClose={editOnClose}
            onSubmit={editOnSubmit}
            selectedUe={selectedUe}
            AcitonItem={ActionItem}
          />
        </Modal>
      )}
      {deleteModal && (
        <ConfirmModal
          isOpen={deleteModal}
          onClose={deleteOnClose}
          onConfirm={deleteOnConfirm}
          title="Supprimer le Cours"
          message="Êtes-vous sûr de vouloir supprimer ce cours ?"
        />
      )}
      {teacherModal && (
        <Modal
          isOpen={teacherModal}
          onClose={teacherOnClose}
        >
          <TeacherAssignmentModal
            onClose={teacherOnClose}
            course={ActionItem}
            onSubmit={teacherOnSubmit}
          />
        </Modal>
      )}
    </div>
  )
}
