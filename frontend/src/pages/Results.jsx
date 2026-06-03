import ResultsPanel from "../components/panel/ResultsPanel"

const Results = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Résultats
          </h2>
          <p className="text-sm text-slate-500">
            Consultez les résultats des étudiants.
          </p>
        </div>
        <ResultsPanel />
      </section>
    </div>
  )
}

export default Results
