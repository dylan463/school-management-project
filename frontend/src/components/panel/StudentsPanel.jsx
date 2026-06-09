import Card from "../ui/Card"
import SearchInput from "../SearchInput"
import Button from "../ui/Button"
import DataTable from '../DataTable'
import { useMemo } from "react"
import useDebounced from '../../hooks/useDebounced'
import Paginator from '../Paginator'
import { PAGINATION_SIZE } from "../../utils/constants"
import { useModal } from '../../context/ModalContext'
import { useState, useEffect } from "react"
import useDRFErrors from "../../hooks/useDRFError"
import { toast } from 'react-toastify'
import { useStudents } from "../../hooks/students/useStudents"
import { useQueryParams } from "../../hooks/useQueryParams"
import { useCreateStudent } from "../../hooks/students/useCreateStudent"
import { useUpdateStudent } from "../../hooks/students/useUpdateStudent"
import { useDeleteStudent } from "../../hooks/students/useDeleteStudent"
import { useSchoolyears } from "../../hooks/schoolyears/useSchoolyears"
import { useFormations } from "../../hooks/formations/useFormations"
import { useSemesters } from "../../hooks/semesters/useSemesters"
import Filter from "../Filter"

function AddOrEditForm({ initialData = {}, onSuccess }) {
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    school_year: "",
    formation: "",
    semester: "",
  });

  const create = useCreateStudent();
  const update = useUpdateStudent();

  const { handleErrors, getError, clearErrors } = useDRFErrors();
  const [loading, setLoading] = useState(false);

  // Charger les listes de sélection pour l'ajout
  const { data: schoolyearsData , isLoading: isSchoolyearsLoading } = useSchoolyears(isEdit ? null : { no_pagination: true });
  const { data: formationsData , isLoading: isFormationsLoading } = useFormations(isEdit ? null : { no_pagination: true });
  const { data: semestersData , isLoading: isSemestersLoading } = useSemesters(isEdit ? null : { no_pagination: true });
  const loadingFilters = isSchoolyearsLoading || isFormationsLoading || isSemestersLoading;
  const schoolyears = schoolyearsData || [];
  const formations = formationsData || [];
  const semesters = semestersData || [];

  // Remplir le formulaire si modification
  useEffect(() => {
    if (initialData?.id) {
      setForm({
        email: initialData.email || "",
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        school_year: "",
        formation: "",
        semester: "",
      });
    }
  }, [initialData?.id, initialData?.email, initialData?.first_name, initialData?.last_name]);

  const handleChange = (e) => {
    clearErrors();
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEdit) {
      if (!form.email || !form.first_name || !form.last_name) return;
    } else {
      if (
        !form.email ||
        !form.first_name ||
        !form.last_name ||
        !form.school_year ||
        !form.formation ||
        !form.semester
      )
        return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        // En modification, seuls first_name, last_name et email restent
        const payload = {
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
        };
        await update.mutateAsync(
          { id: initialData.id, data: payload },
          {
            onSuccess: () => {
              toast.success("Étudiant modifié avec succès");
              onSuccess?.();
            },
          }
        );
      } else {
        // En ajout, tous les champs sont envoyés
        const payload = {
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          school_year: form.school_year,
          formation: form.formation,
          semester: form.semester,
        };
        await create.mutateAsync(payload, {
          onSuccess: () => {
            toast.success("Étudiant créé avec succès");
            onSuccess?.();
          },
        });
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3">
      {/* EMAIL */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex: etudiant@ecole.com"
        />
        {getError("email") && (
          <span className="text-xs text-red-500">{getError("email")}</span>
        )}
      </div>

      {/* FIRST NAME */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Prénom</label>
        <input
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex: Jean"
        />
        {getError("first_name") && (
          <span className="text-xs text-red-500">{getError("first_name")}</span>
        )}
      </div>

      {/* LAST NAME */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Nom</label>
        <input
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex: Dupont"
        />
        {getError("last_name") && (
          <span className="text-xs text-red-500">{getError("last_name")}</span>
        )}
      </div>

      {/* CHAMPS UNIQUEMENT POUR L'AJOUT */}
      {!isEdit && (
        <>
          {/* SCHOOL YEAR */}
          <div className="mb-4 flex flex-col gap-3">
            <Filter
                value={form.formation}
                label="Parcours"
                onChange={handleChange}
                name="formation"
                options={formations}
                otherOptions={[{ key: loadingFilters ? "Chargement…" : "Choisissez une formation", value: "" }]}
                render={(f) => f.text ?? f.code ?? f}
                className="grid grid-cols-1"
            />
            <Filter
                value={form.school_year}
                label="Année scolaire"
                onChange={handleChange}
                name="school_year"
                options={schoolyears}
                otherOptions={[{ key: loadingFilters ? "Chargement…" : "Choisissez une année", value: "" }]}
                render={(y) => y.text ?? y.code ?? y}
                className="grid grid-cols-1"
            />
            <Filter
                value={form.semester}
                label="Semestre"
                onChange={handleChange}
                name="semester"
                options={semesters}
                otherOptions={[{ key: loadingFilters ? "Chargement…" : "Choisissez un semestre", value: "" }]}
                render={(s) => s.code ?? s.order ?? s}
                className="grid grid-cols-1"
            />
          </div>
        </>
      )}

      {/* GLOBAL ERROR */}
      {getError("non_field_errors") && (
        <div className="text-sm text-red-500">{getError("non_field_errors")}</div>
      )}

      {/* SUBMIT */}
      <div className="flex justify-end gap-2 mt-2">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Enregistrement..." : isEdit ? "Modifier" : "Créer"}
        </Button>
      </div>
    </form>
  );
}

function DeleteConfirm({ Data, onSuccess }) {
  const destroy = useDeleteStudent();
  const [loading, setLoading] = useState(false);
  const { handleErrors } = useDRFErrors();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await destroy.mutateAsync(Data.id);
      toast.success("Étudiant supprimé avec succès");
      onSuccess?.();
    } catch (error) {
      handleErrors(error);
      const msg = error.response?.data?.detail || "Une erreur est survenue";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      <p>
        Voulez-vous vraiment supprimer l'étudiant {Data.first_name} {Data.last_name} ?
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={handleConfirm} disabled={loading} variant="primary">
          {loading ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </div>
  );
}

export default function StudentsPanel() {
  const { search, page, setSearch, setPage } = useQueryParams({
    search: { key: "student_search", type: "string", default: "" },
    page: { key: "student_page", type: "number", default: 1 },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("student_page")) {
      setPage(1);
    }
  }, []);

  const debouncedSearch = useDebounced(search);
  const { openModal, closeModal } = useModal();

  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(page && { page }),
    };
  }, [debouncedSearch, page]);

  const { data, isLoading } = useStudents(filters);
  const results = data?.results || [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.count || 0) / PAGINATION_SIZE)
  );

  const columns = [
    { header: "ID", key: "id" },
    { header: "Matricule", key: "username" },
    { header: "Email", key: "email" },
    { header: "Prénom", key: "first_name" },
    { header: "Nom", key: "last_name" },
  ];

  const actions = [
    {
      label: "Modifier",
      handler: (row) =>
        openModal({
          title: "Modifier l'étudiant",
          content: <AddOrEditForm initialData={row} onSuccess={closeModal} />,
        }),
    },
    {
      label: "Supprimer",
      handler: (row) =>
        openModal({
          title: `Supprimer ${row.first_name} ${row.last_name}`,
          content: <DeleteConfirm Data={row} onSuccess={closeModal} />,
        }),
    },
  ];

  return (
    <Card >
      <div className="px-2 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2"></div>
        <SearchInput
          placeholder="Rechercher un étudiant..."
          className="w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="primary"
          onClick={() => {
            openModal({
              title: "Ajouter un étudiant",
              content: <AddOrEditForm onSuccess={closeModal} />,
            });
          }}
        >
          + ajouter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
          Chargement...
        </div>
      )
        : results.length !== 0 ? (
          <DataTable
            data={results}
            columns={columns}
            actions={actions}
            selectionMode={false}
          />
        ) : results.length === 0 && (
          <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
            Aucun résultat
          </div>
        )}
      <Paginator totalPages={totalPages} page={page} setPage={setPage} />
    </Card>
  );
}
