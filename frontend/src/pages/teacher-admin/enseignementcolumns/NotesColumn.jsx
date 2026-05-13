import { useState, useEffect } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/Modal'
import assessmentsService from '../../../services/assessmentsService'
import { toast } from 'react-toastify'
import extractDRFError from '../../../utils/extractError'

// Composant de formulaire pour ajouter/modifier une note
function NoteForm({ onClose, onSubmit,selectedExamen,actionItem}) {
  const [formData, setFormData] = useState({
    score:'',
  })
  const [loading, setLoading] = useState(false)

  const handleChangeScore = (score) => {
    setFormData(prev => ({...prev,score}))
  }

  useEffect(() => {
    if (actionItem) {
      setFormData({
        score:actionItem.grade?.score
      })
    }
  }, [actionItem])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.score) {
      toast.error('Veuillez attribuer une note')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        enrollment:actionItem.id,
        assessment:selectedExamen.id,
        score:parseFloat(formData.score)
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
          Nom et prénom : {actionItem.full_name} 
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          matricule : {actionItem.username} 
        </label>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Note *
        </label>
        <input
          type="number"
          name="value"
          value={formData.score}
          onChange={handleChange}
          placeholder="Ex: 15.5"
          min="0"
          max="20"
          step="0.5"
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
          disabled={loading}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enregistrement...' : (actionItem.grade ? 'Modifier' : 'Ajouter')}
        </button>
      </div>
    </form>
  )
}

export default function NotesColumn({ selectedExamen }) {
  const [notes, setNotes] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [hasNoteFilter,setHasNoteFilter] = useState('')
  const [hasDebtFilter,setHasDebtFilter] = useState('')

  const [actionItem,setActionItem]= useState('')

  const [isgradeModalOpen, setIsGradeModalOpen] = useState(false)
  const [isDeleteConfirmModalOpen,setIsDeleteConfirmModalOpen]=useState(false)
  
  const [openMenuId,setOpenMenuId] = useState(null)


  const loadNotes = async ()=>{
    if (!selectedExamen){
      setNotes([])
      return
    }
    const filters = {}
    if (debouncedSearch) filters.search = debouncedSearch
    if (hasNoteFilter === "true") filters.has_grade = true
    if (hasNoteFilter === "false") filters.has_grade = false
    if (hasDebtFilter === "true") filters.has_debt = true
    if (hasDebtFilter === "false") filters.has_debt = false
    try{
      const response = await assessmentsService.assessmentService.getAsessementAttendant(selectedExamen.id,filters)
      setNotes(response)
    }catch (error){
      toast.error('erreur lors du chargement des notes')
      setNotes([])
    }
  }
    
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])
  
  useEffect(() => {
    loadNotes()
  }, [selectedExamen,debouncedSearch,hasNoteFilter,hasDebtFilter])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.note-menu-container')) {
        setOpenMenuId(null)
      }
      if (showSchoolYearDropdown && !event.target.closest('.school-year-search-container')) {
        setShowSchoolYearDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId, showSchoolYearDropdown])

  const handleGradeSubmit = async (formData) => {
    if (actionItem){
      if (actionItem.grade) {
        await assessmentsService.gradeService.updateGrade(actionItem.grade.id,formData.score)
      }else{
        await assessmentsService.gradeService.createGrade(formData)
      }
      loadNotes()
      toast.success("ok")
    }
  }

  CanPerformAction = true


  const handleDeleteNote = async (actionItem) => {
    try {
      if (actionItem.grade){
        await assessmentsService.gradeService.deleteGrade(actionItem.grade.id)
        loadNotes()
        toast.success('ok')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Erreur lors de la suppression de la note')
    }
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm text-slate-700">Participant et Notes</h3>
        </div>
        <input
          type="text"
          placeholder="Rechercher un participant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          disabled={!selectedExamen}
        />
      </div>

      <div className="p-2 h-96 overflow-y-auto">
        {!selectedExamen ? (
          <p className="text-xs text-slate-500">Sélectionnez un exament pour voir les participants</p>
        ) : notes.length === 0 ? (
          <p className="text-xs text-slate-500">Aucun éleve trouvé</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="relative note-menu-container"
            >
              <div className='w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-1 hover:bg-slate-100 text-slate-700'>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-medium">{note.full_name}</div>
                  {note.username && (
                    <span className="text-xs opacity-75 font-mono bg-slate-100 px-1 py-0.5 rounded">
                      {note.username}
                    </span>
                  )}
                  {note.grade && (
                    <span className="text-xs opacity-75 bg-blue-100 px-1 py-0.5 rounded">
                      note à examen : {note.grade.score}
                    </span>
                  )}
                  {note.debt_year && (
                    <span className="text-xs opacity-75 bg-green-100 px-1 py-0.5 rounded">
                      endété sur l'examen de : {note.debt_year}
                    </span>
                  )}
                </div>
              </div>
              
              {CanPerformAction && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (openMenuId === note.id) {
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
                  {openMenuId === note.id && (
                    <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg z-10 w-[100px]">
                      <button
                        onClick={(e) => {
                          setActionItem(note)
                          setIsGradeModalOpen(true)
                          setOpenMenuId(null)
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50"
                      >
                        {note.grade ? "Modifier": "Ajouter"}
                      </button>
                      <button
                        onClick={(e) => {
                          setActionItem(examen)
                          setIsDeleteConfirmModalOpen(true)
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
      
      {isgradeModalOpen && (
        <Modal isOpen={isgradeModalOpen} onClose={() => {setIsGradeModalOpen(false);setActionItem(null)}}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {actionItem.grade ? 'Modifier une Note' : 'Ajouter une Note'}
          </h3>
          <NoteForm 
            onClose={() => {setIsGradeModalOpen(false);setActionItem(null)}} 
            onSubmit={handleGradeSubmit}
            selectedExamen={selectedExamen}
            actionItem={actionItem}
          />
        </Modal>
      )}
    </div>
  )
}
