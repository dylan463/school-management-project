import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import UEColumn from './enseignements/UEColumn'
import CoursColumn from './enseignements/CoursColumn'
import ExamensColumn from './enseignements/ExamensColumn'
import NotesColumn from './enseignements/NotesColumn'
import ResultsColumn from './enseignements/ResultsColumn'

// Composant pour les breadcrumbs
function Breadcrumbs({ selectedUE, selectedCours, selectedExamen, onClearAll }) {
  const parts = []
  if (selectedUE) parts.push({ label: selectedUE.code, type: 'UE' })
  if (selectedCours) parts.push({ label: selectedCours.code, type: 'Cours' })
  if (selectedExamen) parts.push({ label: selectedExamen.name, type: 'Examen' })

  const hasSelections = parts.length > 0

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-blue-700">Contexte:</span>
        {parts.map((part, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            <span className="text-xs font-medium text-blue-800">{part.label}</span>
            <span className="text-xs text-blue-600">({part.type})</span>
          </div>
        ))}
      </div>
      
      <button
        onClick={onClearAll}
        disabled={!hasSelections}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed rounded transition-colors"
        title="Effacer toutes les sélections"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Tout effacer
      </button>

    </div>
  )
}

export default function Enseignement() {
  const [selectedUE, setSelectedUE] = useState(null)
  const [selectedCours, setSelectedCours] = useState(null)
  const [selectedExamen, setSelectedExamen] = useState(null)
  
  const handleSelectUE = (ue) => {
    setSelectedUE(ue)
    setSelectedCours(null)
    setSelectedExamen(null)
  }
  const handleSelectCours = (cours) => {
    setSelectedCours(cours)
    setSelectedExamen(null)
  }

  const handleSelectExamen = (examen) => {
    setSelectedExamen(examen)
  }

  const handleClearAll = () => {
    setSelectedUE(null)
    setSelectedCours(null)
    setSelectedExamen(null)
  }

  return (
    <div className="fade-in space-y-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Enseignement</h2>
        <p className="text-sm text-slate-500 mt-1">Gestion hiérarchique des UE, Cours, Examens et Notes</p>
      </div>

      {/* Breadcrumbs de contexte */}
      <Breadcrumbs 
        selectedUE={selectedUE}
        selectedCours={selectedCours}
        selectedExamen={selectedExamen}
        onClearAll={handleClearAll}
      />

      {/* Card 1: Unités d'Enseignement et Cours */}
      <Card className="p-0">
        <div className="flex h-[400px]">
          <UEColumn
            selectedItem={selectedUE}
            onSelectItem={handleSelectUE}
          />
        </div>
      </Card>

      <Card className="p-0">
        <div className="flex h-[400px]">
          <CoursColumn
            selectedUE={selectedUE}
            selectedItem={selectedCours}
            onSelectItem={handleSelectCours}
          />       
        </div>
      </Card>

      {/* Card 2: Examens et Notes */}
      <Card className="p-0">
        <div className="flex h-[400px]">
          <ExamensColumn
            selectedCours={selectedCours}
            selectedItem={selectedExamen}
            onSelectItem={handleSelectExamen}
          />
        </div>
      </Card>

      <Card className="p-0">
        <div className="flex h-[400px]">
          <NotesColumn
            selectedExamen={selectedExamen}
          />
        </div>
      </Card>

      {/* Card 3: Résultats par cours */}
      <Card className="p-0">
        <div className="flex h-[400px]">
          <ResultsColumn
            selectedCours={selectedCours}
          />
        </div>
      </Card>
    </div>
  )
}
