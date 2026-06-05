import { SelectedProvider } from "../context/SelectedContext"
import DeliberationResultPanel from "../components/panel/DeliberationResultPanel"
import DeliberationPanel from "../components/panel/DeliberationPanel"

const Deliberations = () => {
  return (
    <SelectedProvider>
      <div className="max-w-7xl mx-auto space-y-10">
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Délibérations
            </h2>
            <p className="text-sm text-slate-500">
              Gérer les délibérations des étudiants.
            </p>
          </div>
          <DeliberationPanel />
        </section>
        <DeliberationResultPanel />
      </div>
    </SelectedProvider>
  )
}

export default Deliberations
