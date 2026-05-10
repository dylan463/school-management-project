import { useState, useEffect } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/Modal'
import structuresService from '../../../services/structuresService'
import { toast } from 'react-toastify'
import extractDRFError from '../../../utils/extractError'

// Composant de formulaire pour ajouter un cours
function AddCoursForm({ onClose, onSubmit, selectedUE }) {
  const [formData, setFormData] = useState({
    code: '',
    label: '',
    volume_horaire: '',
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
    if (!formData.code.trim() || !formData.label.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        course_unit: selectedUE.id
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
            Volume horaire
          </label>
          <input
            type="number"
            name="volume_horaire"
            value={formData.volume_horaire}
            onChange={handleChange}
            placeholder="Ex: 30"
            min="1"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          />
        </div>
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
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description détaillée du cours..."
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
          {loading ? 'Création...' : 'Créer le cours'}
        </button>
      </div>
    </form>
  )
}

export default function CoursColumn({ selectedUE, selectedItem, onSelectItem }) {
  const [cours, setCours] = useState([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [filters, setFilters] = useState({})
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    const filters = {}
    if (debouncedSearch) filters.search = debouncedSearch
    if (selectedUE) filters.course_unit = selectedUE.id
    setFilters(filters)
  }, [debouncedSearch, selectedUE])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const loadCours = async () => {
      if (!selectedUE) {
        setCours([])
        return
      }
      try {
        // TODO: Connecter avec le service approprié
        // const response = await structuresService.courseModuleService.getCourseModules(filters)
        // setCours(response.data || response)
        setCours([]) // Temporaire
      } catch (error) {
        console.error('Error loading cours:', error)
        setCours([])
      }
    }
    loadCours()
  }, [filters, selectedUE])

  const handleAddCours = async (formData) => {
    try {
      // TODO: Connecter avec le service approprié
      // await structuresService.courseModuleService.createCourseModule(formData)
      toast.success('Cours créé avec succès')
      // Recharger la liste
      // const response = await structuresService.courseModuleService.getCourseModules(filters)
      // setCours(response.data || response)
    } catch (error) {
      console.error('Error creating cours:', error)
      throw error
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
          disabled={!selectedUE}
        />
      </div>
      <div className="p-2 h-96 overflow-y-auto">
        {!selectedUE ? (
          <p className="text-xs text-slate-500">Sélectionnez une UE pour voir les cours</p>
        ) : cours.length === 0 ? (
          <p className="text-xs text-slate-500">Aucun cours trouvé</p>
        ) : (
          cours.map((cour) => (
            <button
              key={cour.id}
              onClick={() => onSelectItem(cour)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-1 ${
                selectedItem?.id === cour.id
                  ? 'bg-blue-100 text-blue-800 border border-blue-200 font-medium'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="font-medium">{cour.label || cour.nom}</div>
              {cour.code && (
                <div className="text-xs opacity-75 font-mono">{cour.code}</div>
              )}
              {cour.volume_horaire && (
                <div className="text-xs opacity-75">{cour.volume_horaire}h</div>
              )}
            </button>
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
    </div>
  )
}
