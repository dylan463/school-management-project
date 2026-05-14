import { useState,useEffect } from 'react'
import Deliberation from './inscriptiontabs/Deliberation'
import Registre from './inscriptiontabs/Registre'
import Reinscription from './inscriptiontabs/Reinscription'

export default function Inscriptions() {
  const [activeTab, setActiveTab] = useState(0)

  const TABS = ['registre', 'délibération', 'réinscription']

  useEffect(() => {
    handleChangeTab(activeTab)
  }, [])

  const handleChangeTab = (newTab) => {
    setActiveTab(newTab)
    switch (newTab) {
      case 0:
        break
      case 1:
        break
      case 2:
        break
      default:
        break
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <Registre/>
      case 1:
        return <Deliberation />
      case 2:
        return <Reinscription />
      default:
        return <div>Contenu par défaut</div>
    }
  }

  return (
    <div className="fade-in space-y-5">
       {/* Onglets */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((tabName, index) => (
          <button
            key={tabName}
            onClick={() => handleChangeTab(index)}
            className={`flex-1 min-w-[120px] px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === index
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {tabName}
          </button>
        ))}
      </div>

      {/* Contenu des onglets */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  )
}
