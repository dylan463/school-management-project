import StudentsPanel from "../components/panel/StudentsPanel"

const Students = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">
          Gestion des étudiants
        </h1>
        <p className="mt-2 text-slate-500">
          Gerez les étudiants de votre mention.
        </p>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Liste des étudiants
          </h2>
          <p className="text-sm text-slate-500">
            Consultez, ajoutez, modifiez ou supprimez des comptes étudiants.
          </p>
        </div>

        <StudentsPanel />
      </section>
    </div>
  );
};

export default Students
