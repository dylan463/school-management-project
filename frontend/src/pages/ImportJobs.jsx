import ImportPanel from "../components/panel/ImportPanel"

export default function ImportJobs() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Tâches d'importation</h1>
      <p className="text-slate-500">
        Cette page permettra de visualiser et de gérer l'historique des importations.
      </p>
      <ImportPanel/>
    </div>
  )
}
