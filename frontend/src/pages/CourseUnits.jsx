import CourseUnitsPanel from "../components/panel/CourseUnitsPanel"

const CourseUnits = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Unités d'enseignements
          </h2>
          <p className="text-sm text-slate-500">
            Consultez les unités d'enseignements existantes dans votre formation.
          </p>
        </div>
        <CourseUnitsPanel />
      </section>
    </div>
  )
}

export default CourseUnits
