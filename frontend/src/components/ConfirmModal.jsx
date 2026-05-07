import Modal from './Modal'

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmation",
  message = "Êtes-vous sûr de vouloir continuer ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  type = "danger" // danger, warning, info
}) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getConfirmButtonClass = () => {
    const baseClass = "flex-1 px-3 py-2 text-sm font-medium rounded-lg transition"
    switch (type) {
      case "danger":
        return `${baseClass} text-white bg-red-600 hover:bg-red-700`
      case "warning":
        return `${baseClass} text-white bg-orange-600 hover:bg-orange-700`
      case "info":
        return `${baseClass} text-white bg-blue-600 hover:bg-blue-700`
      default:
        return `${baseClass} text-white bg-slate-600 hover:bg-slate-700`
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="mb-4">
          {type === "danger" && (
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          )}
          {type === "warning" && (
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
              <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-slate-600 mb-6">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={getConfirmButtonClass()}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
