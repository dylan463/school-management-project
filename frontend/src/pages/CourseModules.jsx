import CourseModulesPanel from "../components/panel/CourseModulesPanel"
import CourseModuleChoicePanel from "../components/panel/CourseModuleChoicePanel"

const CourseModules = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Modules de cours
          </h2>
          <p className="text-sm text-slate-500">
            Consultez et gérez les modules de cours de votre formation.
          </p>
        </div>
        <CourseModuleChoicePanel />
        <CourseModulesPanel />
      </section>
    </div>
  )
}

export default CourseModules
