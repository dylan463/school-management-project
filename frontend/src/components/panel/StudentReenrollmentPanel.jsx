import { useState } from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import DataTable from "../DataTable";
import SearchWithDropdown from "../SearchWithDropdown";
import { useSearchDropdown } from "../../hooks/useSearchDropdown";
import SearchableSelect from "../SearchableSelect";
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
  const fdd = useSearchDropdown({ delay: 300, minChars: 1 });
  const sydd = useSearchDropdown({ delay: 300, minChars: 1 });
  const sdd = useSearchDropdown({ delay: 300, minChars: 1 });

  const [selectedFormation, setSelectedFormation] = useState(null);
  const [selectedSchoolyear, setSelectedSchoolyear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);

  const [form, setForm] = useState({
    school_year: "",
    formation: "",
    semester: "",
  });

  const { handleErrors, getError, clearErrors } = useDRFErrors();
  const [loading, setLoading] = useState(false);
  const create = useCreateEnrollment();

  const { data: schoolyearsData, isFetching: isSchoolyearsLoading } = useSchoolyears({ status: "OPEN", no_pagination: true, ...(sydd.query ? { search: sydd.query } : {}) }, { enabled: sydd.enabled });
  const { data: formationsData, isFetching: isFormationsLoading } = useFormations({ no_pagination: true, ...(fdd.query ? { search: fdd.query } : {}) }, { enabled: fdd.enabled });
  const { data: semestersData, isFetching: isSemestersLoading } = useSemesters({ no_pagination: true, ...(sdd.query ? { search: sdd.query } : {}) }, { enabled: sdd.enabled });

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
        <SearchableSelect
          label="Parcours"
          selectedValue={selectedFormation}
          onSelect={(f) => {
            setSelectedFormation(f);
            setForm(prev => ({ ...prev, formation: f.id }));
          }}
          onClear={() => {
            setSelectedFormation(null);
            setForm(prev => ({ ...prev, formation: "" }));
          }}
          options={formations}
          renderOption={(op) => op.text}
          searchDropdownProps={fdd}
          loading={isFormationsLoading}
          placeholder="Rechercher un parcours"
          width="w-full"
        />
        <SearchableSelect
          label="Année scolaire"
          selectedValue={selectedSchoolyear}
          onSelect={(y) => {
            setSelectedSchoolyear(y);
            setForm(prev => ({ ...prev, school_year: y.id }));
          }}
          onClear={() => {
            setSelectedSchoolyear(null);
            setForm(prev => ({ ...prev, school_year: "" }));
          }}
          options={schoolyears}
          renderOption={(op) => op.text}
          searchDropdownProps={sydd}
          loading={isSchoolyearsLoading}
          placeholder="Rechercher une année"
          width="w-full"
        />
        <SearchableSelect
          label="Semestre"
          selectedValue={selectedSemester}
          onSelect={(s) => {
            setSelectedSemester(s);
            setForm(prev => ({ ...prev, semester: s.id }));
          }}
          onClear={() => {
            setSelectedSemester(null);
            setForm(prev => ({ ...prev, semester: "" }));
          }}
          options={semesters}
          renderOption={(op) => op.code}
          searchDropdownProps={sdd}
          loading={isSemestersLoading}
          placeholder="Rechercher un semestre"
          width="w-full mb-16"
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

  const stdd = useSearchDropdown({ delay: 300, minChars: 1 });
  const studentsResponse = useStudents(
    stdd.query ? { search: stdd.query } : {}
  );

  const studentsResults = studentsResponse.data?.results || studentsResponse.data || [];

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollments({
    ...(selectedStudent && { student: selectedStudent.id }),
    no_pagination: true
  });

  const enrollments = enrollmentsData?.results || enrollmentsData || [];

  const { openModal, closeModal } = useModal();

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    stdd.close();
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
    { header: "Statut", key: "status", render: (val) => val == "VALIDATED" ? "Validé" : val == "NOT_VALIDATED" ? "Non Validé" : "Actif" },
  ];

  return (
    <Card className="mt-4 mb-[300px]">
      <div className="p-4">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Réinscription Individuelle</h2>

        <div className="flex flex-col gap-2 w-[400px]">
          <SearchableSelect
            label="Sélectionner un étudiant"
            selectedValue={selectedStudent}
            onSelect={handleSelectStudent}
            onClear={() => setSelectedStudent(null)}
            options={studentsResults}
            renderOption={(option) => (
              <div className="flex gap-4">
                <span className="font-semibold">{option.first_name} {option.last_name}</span>
                <span className="text-xs text-slate-500">{option.username || option.email}</span>
              </div>
            )}
            renderSelected={(selected) => `${selected.first_name} ${selected.last_name} (${selected.username})`}
            searchDropdownProps={stdd}
            loading={studentsResponse.isFetching}
            placeholder="Rechercher par nom, matricule..."
            width="w-full"
          />
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
