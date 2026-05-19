import { useState, useEffect } from 'react'
import Modal from '../../../components/Modal'
import ConfirmModal from '../../../components/ConfirmModal'
import { toast } from 'react-toastify'
import extractDRFError from '../../../utils/extractError'

// ─── Form (private) ───────────────────────────────────────────────────────────
function AddExamenForm({ onClose, onSubmit, selectedCours, editingItem = null, isEditing = false, activeSchoolYear }) {
  const [formData, setFormData] = useState({
    name: '', date: '', type: 'EXAM', session: 'NORMAL', location: '', grade_weight: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (isEditing && editingItem) {
      setFormData({
        name: editingItem.name || '',
        date: editingItem.date || '',
        type: editingItem.type || 'EXAM',
        session: editingItem.session || 'NORMAL',
        location: editingItem.location || '',
        grade_weight: editingItem.grade_weight || ''
      })
    }
  }, [isEditing, editingItem])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.date || !formData.location || !formData.grade_weight) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (!activeSchoolYear?.status == "ACTIVE"){
      toast.error('attendez l\'overture d\'une année scolaire')
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
        course_module: selectedCours.id,
        school_year: activeSchoolYear.id 
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
        <label className="block text-sm font-medium text-slate-700 mb-2">Nom de l'examen *</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange}
          placeholder="Ex: DS1 - Mathématiques"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
          <select name="type" value={formData.type} onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white">
            <option value="EXAM">Examen</option>
            <option value="QUIZ">Quiz</option>
            <option value="TP">Travaux Pratiques</option>
            <option value="ORAL">Oral</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Session</label>
          <select name="session" value={formData.session} onChange={handleChange}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white">
            <option value="NORMAL">Normale</option>
            <option value="RETAKE">Rattrapage</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Lieu *</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange}
            placeholder="Ex: Salle A101"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Poids de la note (%) *</label>
          <input type="number" name="grade_weight" value={formData.grade_weight} onChange={handleChange}
            placeholder="Ex: 50 " min="1" max="100" step="1"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white" />
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onClose}
          className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
          Annuler
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? (isEditing ? 'Modification...' : 'Création...') : (isEditing ? 'Modifier' : 'Créer l\'examen')}
        </button>
      </div>
    </form>
  )
}

// ─── Modals export (used by Enseignement.jsx) ─────────────────────────────────
export function ExamenModals({
  selectedCour,
  ActionItem,
  addModal,
  editModal,
  deleteModal,
  addOnClose,
  editOnClose,
  deleteOnClose,
  addOnSubmit,
  editOnSubmit,
  deleteOnConfirm,
  activeSchoolYear,
}) {
  return (
    <>
      {addModal && (
        <Modal isOpen={addModal} onClose={addOnClose}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Ajouter un Examen</h3>
          <AddExamenForm
            onClose={addOnClose}
            onSubmit={addOnSubmit}
            selectedCours={selectedCour}
            activeSchoolYear={activeSchoolYear}
          />
        </Modal>
      )}
      {editModal && (
        <Modal isOpen={editModal} onClose={editOnClose}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Modifier un Examen</h3>
          <AddExamenForm
            onClose={editOnClose}
            onSubmit={editOnSubmit}
            selectedCours={selectedCour}
            editingItem={ActionItem}
            isEditing={true}
            activeSchoolYear={activeSchoolYear}
          />
        </Modal>
      )}
      {deleteModal && (
        <ConfirmModal
          isOpen={deleteModal}
          onClose={deleteOnClose}
          onConfirm={deleteOnConfirm}
          title="Supprimer l'Examen"
          message="Êtes-vous sûr de vouloir supprimer cet examen ?"
        />
      )}
    </>
  )
}
