import { useState, useEffect } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/Modal'
import assessmentsService from '../../../services/assessmentsService'
import { toast } from 'react-toastify'
import extractDRFError from '../../../utils/extractError'

// Composant de formulaire pour ajouter/modifier une note
function NoteForm({ onClose, onSubmit, selectedExamen, note = null }) {
  const [formData, setFormData] = useState({
    student: '',
    value: '',
    comment: ''
  })
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  useEffect(() => {
    const loadStudents = async () => {
      try {
        // TODO: Charger les étudiants de la formation/cours
        // const response = await userService.getStudents({formation: selectedExamen?.formation})
        // setStudents(response.data || response)
        setStudents([]) // Temporaire
      } catch (error) {
        console.error('Error loading students:', error)
        setStudents([])
      }
    }
    if (selectedExamen) {
      loadStudents()
    }
  }, [selectedExamen])

  useEffect(() => {
    if (note) {
      setFormData({
        student: note.student?.id || '',
        value: note.value || '',
        comment: note.comment || ''
      })
    }
  }, [note])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.student || !formData.value) {
      toast.error('Veuillez sélectionner un étudiant et une note')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        assessment: selectedExamen.id,
        value: parseFloat(formData.value)
      })
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
          Étudiant *
        </label>
        <select
          name="student"
          value={formData.student}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        >
          <option value="">Sélectionner un étudiant</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.first_name} {student.last_name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Note *
        </label>
        <input
          type="number"
          name="value"
          value={formData.value}
          onChange={handleChange}
          placeholder="Ex: 15.5"
          min="0"
          max="20"
          step="0.5"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Commentaire
        </label>
        <textarea
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          placeholder="Commentaire sur la note..."
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
          disabled={loading}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enregistrement...' : (note ? 'Modifier' : 'Ajouter')}
        </button>
      </div>
    </form>
  )
}

export default function NotesColumn({ selectedExamen }) {
  const [notes, setNotes] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filters, setFilters] = useState({})
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  useEffect(() => {
    const filters = {}
    if (debouncedSearch) filters.search = debouncedSearch
    if (selectedExamen) filters.assessment = selectedExamen.id
    setFilters(filters)
  }, [debouncedSearch, selectedExamen])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const loadNotes = async () => {
      if (!selectedExamen) {
        setNotes([])
        return
      }
      try {
        // TODO: Connecter avec le service approprié
        // const response = await assessmentsService.gradeService.getGrades(filters)
        // setNotes(response.data || response)
        setNotes([]) // Temporaire
      } catch (error) {
        console.error('Error loading notes:', error)
        setNotes([])
      }
    }
    loadNotes()
  }, [filters, selectedExamen])

  const handleAddNote = async (formData) => {
    try {
      // TODO: Connecter avec le service approprié
      // await assessmentsService.gradeService.createGrade(formData)
      toast.success('Note ajoutée avec succès')
      // Recharger la liste
      // const response = await assessmentsService.gradeService.getGrades(filters)
      // setNotes(response.data || response)
    } catch (error) {
      console.error('Error creating note:', error)
      throw error
    }
  }

  const handleEditNote = (note) => {
    setEditingNote(note)
    setIsAddModalOpen(true)
  }

  const handleUpdateNote = async (formData) => {
    try {
      // TODO: Connecter avec le service approprié
      // await assessmentsService.gradeService.updateGrade(editingNote.id, formData)
      toast.success('Note modifiée avec succès')
      // Recharger la liste
      // const response = await assessmentsService.gradeService.getGrades(filters)
      // setNotes(response.data || response)
    } catch (error) {
      console.error('Error updating note:', error)
      throw error
    }
  }

  const handleDeleteNote = async (note) => {
    try {
      // TODO: Connecter avec le service approprié
      // await assessmentsService.gradeService.deleteGrade(note.id)
      toast.success('Note supprimée avec succès')
      // Recharger la liste
      // const response = await assessmentsService.gradeService.getGrades(filters)
      // setNotes(response.data || response)
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Erreur lors de la suppression de la note')
    }
  }

  const closeModal = () => {
    setIsAddModalOpen(false)
    setEditingNote(null)
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm text-slate-700">Notes</h3>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            variant="outline"
            className="text-xs px-2 py-1 h-7"
            disabled={!selectedExamen}
          >
            + Ajouter
          </Button>
        </div>
        <input
          type="text"
          placeholder="Rechercher une note..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          disabled={!selectedExamen}
        />
      </div>
      <div className="p-2 h-96 overflow-y-auto">
        {!selectedExamen ? (
          <p className="text-xs text-slate-500">Sélectionnez un examen pour voir les notes</p>
        ) : notes.length === 0 ? (
          <p className="text-xs text-slate-500">Aucune note trouvée</p>
        ) : (
          <div className="space-y-1">
            {notes.map((note) => (
              <div key={note.id} className="relative group p-2 border border-slate-200 rounded-lg mb-1">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {note.student?.first_name} {note.student?.last_name}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-sm font-bold text-slate-700">
                        {note.value}/20
                      </span>
                      {note.value >= 10 ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          Validé
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Non validé
                        </span>
                      )}
                    </div>
                    {note.comment && (
                      <div className="text-xs text-slate-500 mt-1">{note.comment}</div>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="Modifier"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} onClose={closeModal}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {editingNote ? 'Modifier une Note' : 'Ajouter une Note'}
          </h3>
          <NoteForm 
            onClose={closeModal} 
            onSubmit={editingNote ? handleUpdateNote : handleAddNote}
            selectedExamen={selectedExamen}
            note={editingNote}
          />
        </Modal>
      )}
    </div>
  )
}
