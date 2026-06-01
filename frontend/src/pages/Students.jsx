import StudentsPanel from "../components/panel/StudentsPanel"
import StudentUploadPanel from "../components/panel/StudentUploadPanel";

const Students = () => {
  return (
    <div className="flex justify-between">
      <div className="w-3/4">
        <header>
          <h1 className="text-2xl font-bold text-slate-800">
            Gestion des étudiants
          </h1>
          <p className="text-sm text-slate-500">
            Consultez, ajoutez, modifiez ou supprimez des comptes étudiants.
          </p>
        </header>
        <section className="space-y-4">
          <StudentsPanel />
        </section>
      </div>
      <StudentUploadPanel />

    </div>
  );
};

export default Students
