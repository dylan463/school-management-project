import { useState, useEffect } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/Modal'
import structuresService from '../../../services/structuresService'
import assessmentsService from '../../../services/assessmentsService'
import { toast } from 'react-toastify'
import extractDRFError from '../../../utils/extractError'

// Composant de formulaire pour ajouter un examen
function AddExamenForm({ onClose, onSubmit, selectedCours }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    duration: '',
    type: 'EXAM',
    description: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.date) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        course_module: selectedCours.id
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Titre *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ex: DS1 - Mathématiques"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Durée (minutes)
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="Ex: 120"
            min="15"
            max="240"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Date *
        </label>
        <input
          type="datetime-local"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        />
      </div>

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
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description détaillée de l'examen..."
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
          {loading ? 'Création...' : 'Créer l\'examen'}
        </button>
      </div>
    </form>
  )
}

export default function ExamensColumn({ selectedCours, selectedItem, onSelectItem }) {
  const [examens, setExamens] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filters, setFilters] = useState({})
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    const filters = {}
    if (debouncedSearch) filters.search = debouncedSearch
    if (selectedCours) filters.course_module = selectedCours.id
    setFilters(filters)
  }, [debouncedSearch, selectedCours])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const loadExamens = async () => {
      if (!selectedCours) {
        setExamens([])
        return
      }
      try {
        // TODO: Connecter avec le service approprié
        // const response = await assessmentsService.assessmentService.getAssessments(filters)
        // setExamens(response.data || response)
        setExamens([]) // Temporaire
      } catch (error) {
        console.error('Error loading examens:', error)
        setExamens([])
      }
    }
    loadExamens()
  }, [filters, selectedCours])

  const handleAddExamen = async (formData) => {
    try {
      // TODO: Connecter avec le service approprié
      // await assessmentsService.assessmentService.createAssessment(formData)
      toast.success('Examen créé avec succès')
      // Recharger la liste
      // const response = await assessmentsService.assessmentService.getAssessments(filters)
      // setExamens(response.data || response)
    } catch (error) {
      console.error('Error creating examen:', error)
      throw error
    }
  }

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
            disabled={!selectedCours}
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
      </div>
      <div className="p-2 h-96 overflow-y-auto">
        {!selectedCours ? (
          <p className="text-xs text-slate-500">Sélectionnez un cours pour voir les examens</p>
        ) : examens.length === 0 ? (
          <p className="text-xs text-slate-500">Aucun examen trouvé</p>
        ) : (
          examens.map((examen) => (
            <button
              key={examen.id}
              onClick={() => onSelectItem(examen)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-1 ${
                selectedItem?.id === examen.id
                  ? 'bg-blue-100 text-blue-800 border border-blue-200 font-medium'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="font-medium">{examen.title || examen.nom}</div>
              {examen.date && (
                <div className="text-xs opacity-75">
                  {new Date(examen.date).toLocaleDateString('fr-FR')}
                </div>
              )}
              {examen.duration && (
                <div className="text-xs opacity-75">{examen.duration} min</div>
              )}
              {examen.type && (
                <div className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 inline-block mt-1">
                  {examen.type}
                </div>
              )}
            </button>
          ))
        )}
      </div>
      
      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Ajouter un Examen
          </h3>
          <AddExamenForm 
            onClose={() => setIsAddModalOpen(false)} 
            onSubmit={handleAddExamen}
            selectedCours={selectedCours}
          />
        </Modal>
      )}
    </div>
  )
}
