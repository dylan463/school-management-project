import { useState, useEffect } from 'react'
import Modal from '../../../components/Modal'
import { toast } from 'react-toastify'
import extractDRFError from '../../../utils/extractError'

// ─── Form (private) ───────────────────────────────────────────────────────────
function NoteForm({ onClose, onSubmit, selectedExamen, actionItem }) {
  const [formData, setFormData] = useState({ score: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (actionItem) {
      setFormData({ score: actionItem.grade?.score ?? '' })
    }
  }, [actionItem])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.score === '') {
      toast.error('Veuillez attribuer une note')
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        enrollment: actionItem.id,
        assessment: selectedExamen.id,
        score: parseFloat(formData.score)
      })
      onClose()
    } catch (error) {
      toast.error(error.response.data.er)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nom et prénom : <span className="font-semibold">{actionItem?.full_name}</span>
        </label>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Matricule : <span className="font-mono">{actionItem?.username}</span>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Note *</label>
        <input
          type="number"
          name="score"
          value={formData.score}
          onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
          placeholder="Ex: 15.5"
          min="0" max="20" step="0.5"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
          required
        />
      </div>
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onClose}
          className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
          Annuler
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Enregistrement...' : (actionItem?.grade ? 'Modifier' : 'Ajouter')}
        </button>
      </div>
    </form>
  )
}

// ─── Modals export (used by Enseignement.jsx) ─────────────────────────────────
export function NoteModals({
  selectedExamen,
  ActionItem,
  gradeModal,
  gradeOnClose,
  gradeOnSubmit,
}) {
  return (
    <>
      {gradeModal && ActionItem && (
        <Modal isOpen={gradeModal} onClose={gradeOnClose}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            {ActionItem.grade ? 'Modifier une Note' : 'Ajouter une Note'}
          </h3>
          <NoteForm
            onClose={gradeOnClose}
            onSubmit={gradeOnSubmit}
            selectedExamen={selectedExamen}
            actionItem={ActionItem}
          />
        </Modal>
      )}
    </>
  )
}
