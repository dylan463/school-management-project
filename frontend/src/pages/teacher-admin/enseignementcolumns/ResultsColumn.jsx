import { useState, useEffect } from 'react'
import Button from '../../../components/ui/Button'
import assessmentsService from '../../../services/assessmentsService'

export default function ResultsColumn({ selectedCours }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadResults = async () => {
      if (!selectedCours) {
        setResults([])
        return
      }
      
      setLoading(true)
      try {
        // TODO: Connecter avec le service approprié pour récupérer les résultats du cours
        // const response = await assessmentsService.getResultsByCourse(selectedCours.id)
        // setResults(response.data || response)
        
        // Données mockées pour l'exemple
        setResults([
          { id: 1, type: 'moyenne', value: 14.5, label: 'Moyenne générale', color: 'blue' },
          { id: 2, type: 'max', value: 18.0, label: 'Note la plus haute', color: 'green' },
          { id: 3, type: 'min', value: 8.0, label: 'Note la plus basse', color: 'red' },
          { id: 4, type: 'students', value: 25, label: 'Nombre d\'étudiants', color: 'purple' },
          { id: 5, type: 'success_rate', value: 72, label: 'Taux de réussite', color: 'emerald' }
        ])
      } catch (error) {
        console.error('Error loading results:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }
    
    loadResults()
  }, [selectedCours])

  if (!selectedCours) {
    return (
      <div className="flex-1">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-sm text-slate-700">Résultats</h3>
        </div>
        <div className="p-2 h-96 overflow-y-auto">
          <div className="text-center py-8">
            <p className="text-xs text-slate-500">Sélectionnez un cours pour voir les résultats</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm text-slate-700">Résultats</h3>
          <Button
            onClick={() => {
              // TODO: Exporter les résultats
              console.log('Exporter résultats du cours:', selectedCours)
            }}
            size="sm"
            variant="outline"
            className="text-xs px-2 py-1 h-7"
          >
            Exporter
          </Button>
        </div>
      </div>
      <div className="p-2 h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-xs text-slate-500">Chargement...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-slate-500">Aucun résultat trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <div key={result.id} className="p-3 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm text-slate-700">{result.label}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {result.type === 'moyenne' && 'Moyenne de toutes les notes'}
                      {result.type === 'max' && 'Note maximale obtenue'}
                      {result.type === 'min' && 'Note minimale obtenue'}
                      {result.type === 'students' && 'Total des étudiants évalués'}
                      {result.type === 'success_rate' && 'Pourcentage de réussite (≥10/20)'}
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    result.color === 'blue' ? 'text-blue-600' :
                    result.color === 'green' ? 'text-green-600' :
                    result.color === 'red' ? 'text-red-600' :
                    result.color === 'purple' ? 'text-purple-600' :
                    result.color === 'emerald' ? 'text-emerald-600' :
                    'text-slate-600'
                  }`}>
                    {result.type === 'success_rate' ? `${result.value}%` : 
                     result.type === 'students' ? result.value :
                     result.value.toFixed(1)}
                  </div>
                </div>
                
                {/* Barre de progression pour le taux de réussite */}
                {result.type === 'success_rate' && (
                  <div className="mt-3">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${result.value}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Statistiques supplémentaires */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-sm text-slate-700 mb-3">Statistiques détaillées</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-white rounded border border-slate-200">
                  <div className="text-lg font-bold text-slate-800">
                    {results.find(r => r.type === 'students')?.value || 0}
                  </div>
                  <div className="text-xs text-slate-500">Étudiants évalués</div>
                </div>
                <div className="text-center p-3 bg-white rounded border border-slate-200">
                  <div className="text-lg font-bold text-slate-800">
                    {Math.round((results.find(r => r.type === 'success_rate')?.value || 0) * (results.find(r => r.type === 'students')?.value || 0) / 100)}
                  </div>
                  <div className="text-xs text-slate-500">Étudiants réussis</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
