import HistoryPanel from "../components/panel/HistoryPanel"
import HistoryResultPanel from "../components/panel/HistoryResultPanel"
import { SelectedProvider } from "../context/SelectedContext"


const History = () => {
  return (
    <SelectedProvider>
      <div className="max-w-7xl mx-auto space-y-10">
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Historique
            </h2>
            <p className="text-sm text-slate-500">
              Voir l'historique des inscriptions au sein de la mentions.
            </p>
          </div>
          <HistoryPanel />
        </section>
        <HistoryResultPanel/>
      </div>
    </SelectedProvider>
  )
}

export default History
