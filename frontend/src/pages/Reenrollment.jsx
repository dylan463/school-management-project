import ReenrollmentPanel from "../components/panel/ReenrollmentPanel"
import ReenrollmentUploadPanel from "../components/panel/ReenrollmentUploadPanel";
import StudentReenrollmentPanel from "../components/panel/StudentReenrollmentPanel";

const Reenrollment = () => {
  return (
    <div className="flex justify-between">
      <div>
        <header>
          <h1 className="text-2xl font-bold text-slate-800">
            Gestion des Réinscriptions
          </h1>
          <p className="text-sm text-slate-500 mb-4">
            Réinscriver facilement vos étudiants avec leurs emails et matricules grâce à l'outil d'importation ou à l'inscription manuelle.
          </p>
        </header>
        <section className="space-y-4">
          <ReenrollmentUploadPanel />
        </section>
        <ReenrollmentPanel />
        <StudentReenrollmentPanel />
      </div>

    </div>
  )
}

export default Reenrollment


