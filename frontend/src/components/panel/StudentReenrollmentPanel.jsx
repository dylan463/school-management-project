import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import DataTable from "../DataTable";
import SearchWithDropdown from "../SearchWithDropdown";
import Filter from "../Filter";
import { useSearchDropdown } from "../../hooks/useSearchDropdown";
import { useStudents } from "../../hooks/students/useStudents";
import { useEnrollments } from "../../hooks/enrollments/useEnrollments";
import { useSchoolyears } from "../../hooks/schoolyears/useSchoolyears";
import { useFormations } from "../../hooks/formations/useFormations";
import { useSemesters } from "../../hooks/semesters/useSemesters";
import { useCreateEnrollment } from "../../hooks/enrollments/useCreateEnrollment";
import useDRFErrors from "../../hooks/useDRFError";
import { toast } from "react-toastify";
import { useModal } from "../../context/ModalContext";

function AddEnrollmentForm({ studentId, onSuccess }) {
  const [form, setForm] = useState({
    school_year: "",
    formation: "",
    semester: "",
  });

  const { handleErrors, getError, clearErrors } = useDRFErrors();
  const [loading, setLoading] = useState(false);
  const create = useCreateEnrollment();

  const { data: schoolyearsData, isLoading: isSchoolyearsLoading } = useSchoolyears({ status: "OPEN", no_pagination: true });
  const { data: formationsData, isLoading: isFormationsLoading } = useFormations({ no_pagination: true });
  const { data: semestersData, isLoading: isSemestersLoading } = useSemesters({ no_pagination: true });

  const schoolyears = schoolyearsData?.results || schoolyearsData || [];
  const formations = formationsData?.results || formationsData || [];
  const semesters = semestersData?.results || semestersData || [];

  const handleChange = (e) => {
    clearErrors();
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.school_year || !form.formation || !form.semester) return;

    setLoading(true);
    try {
      await create.mutateAsync({
        student: studentId,
        school_year: form.school_year,
        formation: form.formation,
        semester: form.semester,
      });
      toast.success("Inscription ajoutée avec succès");
      onSuccess?.();
    } catch (error) {
      handleErrors(error);
      if (error.response?.data?.non_field_errors) {
        toast.error(error.response.data.non_field_errors[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3 w-[400px]">
      <div className="mb-4 flex flex-col gap-3">
        <Filter
          value={form.formation}
          label="Parcours"
          onChange={handleChange}
          name="formation"
          options={formations}
          otherOptions={[{ key: isFormationsLoading ? "Chargement…" : "Choisissez une formation", value: "" }]}
          render={(f) => f.text ?? f.code ?? f}
          className="grid grid-cols-1"
        />
        <Filter
          value={form.school_year}
          label="Année scolaire (Ouvertes)"
          onChange={handleChange}
          name="school_year"
          options={schoolyears}
          otherOptions={[{ key: isSchoolyearsLoading ? "Chargement…" : "Choisissez une année", value: "" }]}
          render={(y) => y.text ?? y.code ?? y}
          className="grid grid-cols-1"
        />
        <Filter
          value={form.semester}
          label="Semestre"
          onChange={handleChange}
          name="semester"
          options={semesters}
          otherOptions={[{ key: isSemestersLoading ? "Chargement…" : "Choisissez un semestre", value: "" }]}
          render={(s) => s.code ?? s.order ?? s}
          className="grid grid-cols-1"
        />
      </div>

      {getError("non_field_errors") && (
        <div className="text-sm text-red-500">{getError("non_field_errors")}</div>
      )}

      <div className="flex justify-end gap-2 mt-2">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Enregistrement..." : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}

export default function StudentReenrollmentPanel() {
  const [selectedStudent, setSelectedStudent] = useState(null);

  const studentSearchDropdown = useSearchDropdown({ delay: 300, minChars: 1 });
  const studentsResponse = useStudents(
    studentSearchDropdown.query ? { search: studentSearchDropdown.query } : {}
  );

  const studentsResults = studentsResponse.data?.results || studentsResponse.data || [];

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollments({
    student: selectedStudent ? selectedStudent.id : -1,
    no_pagination: true
  });

  const enrollments = enrollmentsData?.results || enrollmentsData || [];

  const { openModal, closeModal } = useModal();

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    studentSearchDropdown.close();
  };

  const openAddModal = () => {
    openModal({
      title: "Nouvelle inscription",
      content: <AddEnrollmentForm
        studentId={selectedStudent.id}
        onSuccess={() => {
          closeModal();
        }}
      />
    }
    );
  };

  const columns = [
    { header: "Année Scolaire", key: "school_year", render: (sy) => sy?.text || sy?.code || sy },
    { header: "Parcours", key: "formation", render: (f) => f?.text || f?.code || f },
    { header: "Semestre", key: "semester", render: (s) => s?.code || s },
    { header: "Statut", key: "status" },
  ];

  return (
    <Card className="mt-4 mb-[300px]">
      <div className="p-4">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Réinscription Individuelle</h2>

        <div className="flex flex-col gap-2 w-[400px]">
          <label className="text-slate-600 text-sm font-bold">Sélectionner un étudiant</label>
          {!selectedStudent ? (
            <SearchWithDropdown
              value={studentSearchDropdown.value}
              onChange={studentSearchDropdown.onChange}
              isOpen={studentSearchDropdown.isOpen}
              close={studentSearchDropdown.close}
              containerRef={studentSearchDropdown.containerRef}
              options={studentsResults}
              loading={studentsResponse.isFetching}
              onSelect={handleSelectStudent}
              renderOption={(option) => (
                <div className="flex gap-4">
                  <span className="font-semibold">{option.first_name} {option.last_name}</span>
                  <span className="text-xs text-slate-500">{option.username || option.email}</span>
                </div>
              )}
              placeholder="Rechercher par nom, matricule..."
              inputClassName="w-full"
            />
          ) : (
            <div className="flex items-center justify-between border h-[42px] rounded-md px-3 py-2 bg-slate-50">
              <div className="flex flex-col">
                <span className="text-sm font-semibold truncate">{selectedStudent.first_name} {selectedStudent.last_name}</span>
                <span className="text-xs text-slate-500">{selectedStudent.username}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="text-xs text-red-500 hover:underline ml-2"
              >
                Changer
              </button>
            </div>
          )}
        </div>

        {selectedStudent && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700">Inscriptions de {selectedStudent.first_name}</h3>
              <Button variant="primary" onClick={openAddModal}>
                + Ajouter une inscription
              </Button>
            </div>

            {enrollmentsLoading ? (
              <div className="flex justify-center items-center h-[200px] text-slate-500">Chargement...</div>
            ) : enrollments.length > 0 ? (
              <DataTable
                data={enrollments}
                columns={columns}
                selectionMode={false}
              />
            ) : (
              <div className="flex justify-center items-center h-[200px] text-slate-500">
                Aucune inscription trouvée.
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
