import SchoolYearPanel from "../components/panel/SchoolYearPanel"
import Card from '../components/ui/Card'

const Schoolyears = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Années Scolaires
          </h2>
          <p className="text-sm text-slate-500">
            Créez, modifiez et consultez les années scolaires existantes.
          </p>
        </div>
        <SchoolYearPanel />
      </section>
    </div>
  )
}

export default Schoolyears
