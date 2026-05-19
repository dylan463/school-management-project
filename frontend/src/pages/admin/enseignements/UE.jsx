import { useState, useEffect, useCallback } from 'react'
import Button from '../../../components/ui/Button'
import Modal from '../../../components/Modal'
import structuresService from '../../../services/structuresService'
import { toast } from 'react-toastify'
import ConfirmModal from '../../../components/ConfirmModal'
import Filter from '../../../components/Filter'


// Composant de formulaire pour ajouter une UE
function AddUEForm({ onClose, onSubmit, ActionItem = null }) {
  const [formData, setFormData] = useState({
    code: '',
    label: '',
    formation: '',
    semester: '',
  })
  const [formations, setFormations] = useState([])
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  const loadEditingData = useCallback(async () => {
    try {
      if (!ActionItem) {
        setFormData({
          code: '',
          label: '',
          formation: '',
          semester: '',
        })
        return
      }
      setFormData({
        code: ActionItem.code,
        label: ActionItem.label,
        formation: ActionItem.formation.id,
        semester: ActionItem.semester.id,
      })
    } catch {
      console.log("veillez verifier les champs disponible dans editingItem")
    }
  }, [ActionItem])

  const loadFormations = useCallback(async () => {
    try {
      const response = await structuresService.FormationService.getFormations()
      setFormations(response)
    } catch { setFormations([]) }
  }, [])

  const loadSemesters = useCallback(async () => {
    const filters = {}
    if (formData.formation) filters.formation = formData.formation
    try {
      const response = await structuresService.SemesterService.getSemesters(filters)
      setSemesters(response)
    } catch { setSemesters([]) }
  }, [formData.formation])

  useEffect(() => { loadEditingData() }, [loadEditingData])
  useEffect(() => { loadFormations() }, [loadFormations])
  useEffect(() => { loadSemesters() }, [loadSemesters])


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
      }
      await onSubmit(data)
      onClose()
    } catch {
      const msg = "erreur pendant la submission du formulaire"
      console.log(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-2 gap-4">
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

      <Filter
        value={formData.formation}
        label='formation'
        name='formation'
        onChange={(e) => handleChange(e)}
        options={formations}
        optionAttr='code'
        otherOptions={[{ value: '', label: "Tous" }]}
      />
      <Filter
        value={formData.semester}
        label='semestre'
        name='semester'
        onChange={(e) => handleChange(e)}
        options={semesters}
        optionAttr='code'
        otherOptions={[{ value: '', label: "Tous" }]}
      />

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

export function UeModals({
  addModal,
  addOnClose,
  addOnSubmit,
  ActionItem,
  editModal,
  editOnclose,
  editOnSubmit,
  deleteModal,
  deleteOnClose,
  deleteOnConfirm,
}) {
  return (<>
    {addModal && (
      <Modal isOpen={addModal} onClose={addOnClose}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          Ajouter une Unité d'Enseignement
        </h3>
        <AddUEForm onClose={addOnClose} onSubmit={addOnSubmit} />
      </Modal>
    )}
    {editModal && (
      <Modal isOpen={editModal} onClose={editOnclose}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          Modifier une Unité d'Enseignement
        </h3>
        <AddUEForm onClose={editOnclose} onSubmit={editOnSubmit} ActionItem={ActionItem} />
      </Modal>
    )}
    {deleteModal && (
      <ConfirmModal
        isOpen={deleteModal}
        onClose={deleteOnClose}
        onConfirm={deleteOnConfirm}
        title="Supprimer l'Unité d'Enseignement"
        message="Êtes-vous sûr de vouloir supprimer cette Unité d'Enseignement ?"
      />
    )}
  </>
  )
}
