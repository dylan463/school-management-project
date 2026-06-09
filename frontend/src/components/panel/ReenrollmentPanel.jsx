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
import { useQueryParams } from "../../hooks/useQueryParams"
import { useCreateStudent } from "../../hooks/students/useCreateStudent"
import { useUpdateStudent } from "../../hooks/students/useUpdateStudent"
import { useDeleteStudent } from "../../hooks/students/useDeleteStudent"
import { useSchoolyears } from "../../hooks/schoolyears/useSchoolyears"
import { useFormations } from "../../hooks/formations/useFormations"
import { useFormation } from "../../hooks/formations/useFormation"
import { useSchoolyear } from "../../hooks/schoolyears/useSchoolyear"
import { useSemesters } from "../../hooks/semesters/useSemesters"
import Filter from "../Filter"
import { useSearchDropdown } from "../../hooks/useSearchDropdown"
import SearchWithDropdown from "../SearchWithDropdown"
import { useEnrollments } from "../../hooks/enrollments/useEnrollments"
import { useCreateEnrollment } from "../../hooks/enrollments/useCreateEnrollment"
import { useDeleteEnrollment } from "../../hooks/enrollments/useDeleteEnrollment"



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
  const { data: schoolyearsData, isLoading: isSchoolyearsLoading } = useSchoolyears(isEdit ? null : { no_pagination: true });
  const { data: formationsData, isLoading: isFormationsLoading } = useFormations(isEdit ? null : { no_pagination: true });
  const { data: semestersData, isLoading: isSemestersLoading } = useSemesters(isEdit ? null : { no_pagination: true });
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

export default function ReenrollmentPanel() {
  const {
    search,
    setSearch,
    page1,
    setPage1,
    formation1,
    setFormation1,
    semester1,
    setSemester1,
    schoolyear1,
    setSchoolyear1,
    page2,
    setPage2,
    formation2,
    setFormation2,
    semester2,
    setSemester2,
    schoolyear2,
    setSchoolyear2,
  } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page1: { key: "page1", type: "number", default: 1 },
    formation1: { key: "formation1", type: "number", default: "" },
    semester1: { key: "semseter1", type: "number", default: "" },
    schoolyear1: { key: "schoolyear1", type: "number", default: "" },
    page2: { key: "page2", type: "number", default: 1 },
    formation2: { key: "formation2", type: "number", default: "" },
    semester2: { key: "semseter2", type: "number", default: "" },
    schoolyear2: { key: "schoolyear2", type: "number", default: "" },
  });

  const formation1searchDropDown = useSearchDropdown({ delay: 300, minChars: 1 })
  const schoolyear1searchDropDown = useSearchDropdown({ delay: 300, minChars: 1 })
  const formation2searchDropDown = useSearchDropdown({ delay: 300, minChars: 1 })
  const schoolyear2searchDropDown = useSearchDropdown({ delay: 300, minChars: 1 })

  const { data: formation1Data } = useFormation(formation1)
  const { data: formation2Data } = useFormation(formation2)
  const { data: schoolyear1Data } = useSchoolyear(schoolyear1)
  const { data: schoolyear2Data } = useSchoolyear(schoolyear2)

  const formation1response = useFormations(formation1searchDropDown.query ? {
    search: formation1searchDropDown.query
  } : {}, formation1searchDropDown.query.length > 0)
  const formation1results = formation1response.data?.results ? formation1response.data?.results : []

  const formation2response = useFormations(formation2searchDropDown.query ? {
    search: formation2searchDropDown.query
  } : {}, formation2searchDropDown.query.length > 0)
  const formation2results = formation2response.data?.results ? formation2response.data?.results : []

  const schoolyear1response = useSchoolyears(schoolyear1searchDropDown.query ? {
    search: schoolyear1searchDropDown.query,
    status: "CLOSED"
  } : {}, schoolyear1searchDropDown.query.length > 0)
  const schoolyear1results = schoolyear1response.data?.results ? schoolyear1response.data?.results : []

  const schoolyear2response = useSchoolyears(schoolyear2searchDropDown.query ? {
    search: schoolyear2searchDropDown.query,
    status: "OPEN"
  } : {}, schoolyear2searchDropDown.query.length > 0)
  const schoolyear2results = schoolyear2response.data?.results ? schoolyear2response.data?.results : []

  const semester1response = useSemesters({
    is_active: true,
    no_pagination: true
  })
  const semester1results = semester1response.data ? semester1response.data : []

  const filtersLoading = formation1response.isLoading || semester1response.isLoading || schoolyear1response.isLoading || schoolyear2response.isLoading

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("page1")) {
      setPage1(1);
    }
    if (!params.get("page2")) {
      setPage2(1);
    }
  }, []);

  const debouncedSearch = useDebounced(search);
  const { openModal, closeModal } = useModal();

  const filters1 = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(page1 && { page: page1 }),
      ...(semester1 && { semester: semester1 }),
      ...(formation1 && { formation: formation1 }),
      ...(schoolyear1 && { school_year: schoolyear1 }),
      ...(schoolyear2 && { exclude_year: schoolyear2 })
    };
  }, [debouncedSearch, page1, semester1, formation1, schoolyear1]);

  const filters2 = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(page2 && { page: page2 }),
      ...(semester2 && { semester: semester2 }),
      ...(formation2 && { formation: formation2 }),
      ...(schoolyear2 && { school_year: schoolyear2 }),
    };
  }, [debouncedSearch, page2, semester2, formation2, schoolyear2]);

  const { data: enrollments1, isLoading: enrollments1loading } = useEnrollments(filters1)
  const enrollments1results = enrollments1?.results ? enrollments1.results : []

  const { data: enrollments2, isLoading: enrollments2loading } = useEnrollments(filters2)
  const enrollments2results = enrollments2?.results ? enrollments2.results : []

  const totalPages1 = Math.max(
    1,
    Math.ceil((enrollments1?.count || 0) / PAGINATION_SIZE)
  );
  const totalPages2 = Math.max(
    1,
    Math.ceil((enrollments2?.count || 0) / PAGINATION_SIZE)
  );

  const promote = useCreateEnrollment()
  const destroy = useDeleteEnrollment()

  const handleSelectFormation1 = (formation) => {
    setFormation1(formation.id)
    formation1searchDropDown.close()
  }
  const handleSelectSchoolyear1 = (schoolyear) => {
    setSchoolyear1(schoolyear.id)
    schoolyear1searchDropDown.close()
  }
  const handleSelectFormation2 = (formation) => {
    setFormation2(formation.id)
    formation2searchDropDown.close()
  }
  const handleSelectSchoolyear2 = (schoolyear) => {
    setSchoolyear2(schoolyear.id)
    schoolyear2searchDropDown.close()
  }

  const canPromote = semester1 && semester2 && formation1Data && formation2Data && schoolyear1Data && schoolyear2Data
  const handleSelectEnrollment = (enrollment) => {

  }

  const handlePromote = async (enrollment) => {
    if (!canPromote) return
    try {
      await promote.mutateAsync({ student: enrollment.student.id, formation: formation2Data.id, school_year: schoolyear2Data.id, semester: semester2 })

    } catch (error) {
      console.log(error.response.data)
    }

  }

  const handleDelete = async (enrollment) => {
    await destroy.mutateAsync(enrollment.id)
  }


  const columns = [
    { header: "Matricule", key: "student", render: (student) => student.username },
    {
      header: "Etudiant", key: "student", render: (student) => {
        return student.first_name || student.last_name ? `${student.first_name} ${student.last_name}` : ' '
      }
    },
  ];

  const actions1 = [
    {
      label: "Promouvoir",
      handler: handlePromote,
      conditionGlobal: !!canPromote
    },
  ];
  const actions2 = [
    {
      label: "Supprimer",
      handler: handleDelete,
    },
  ];

  return (
    <>
      <Card>
        <div className="px-2 py-2 flex justify-center items-center">
          <div className="flex items-center gap-2"></div>
          <SearchInput
            placeholder="Rechercher un étudiant..."
            className="w-[300px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* {ancienne année scolaire} */}

        <div className="flex w-full">
          <div className="pl-2" >
            <h1 className="ml-3 text-red-600 font-bold">ETUDIANT NON INSCRIT</h1>
            {/* filtres */}
            <div className="w-[500px] flex flex-wrap gap-2 pl-2 ">
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Parcours</label>
                {!formation1Data ? (
                  <SearchWithDropdown
                    value={formation1searchDropDown.value}
                    onChange={formation1searchDropDown.onChange}
                    isOpen={formation1searchDropDown.isOpen}
                    close={formation1searchDropDown.close}
                    containerRef={formation1searchDropDown.containerRef}
                    options={formation1results}
                    loading={formation1response.isFetching}
                    onSelect={handleSelectFormation1}
                    renderOption={(option) => <div className="flex gap-x-2 items-center">
                      <div>{option.text}</div>
                    </div>}
                    placeholder="Rechercher..."
                    inputClassName="w-[200px]"
                  />
                ) : (
                  <div className="flex items-center justify-between border h-[38px] w-[200px] rounded-md px-3 py-2 bg-slate-50">
                    <span className="text-sm truncate">{formation1Data?.text}</span>
                    <button
                      type="button"
                      onClick={() => setFormation1("")}
                      className="text-xs text-red-500 hover:underline ml-2"
                    >
                      Changer
                    </button>
                  </div>
                )}
              </div>

              {/* SchoolYear */}
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Année Scolaire</label>
                {!schoolyear1Data ? (
                  <SearchWithDropdown
                    value={schoolyear1searchDropDown.value}
                    onChange={schoolyear1searchDropDown.onChange}
                    isOpen={schoolyear1searchDropDown.isOpen}
                    close={schoolyear1searchDropDown.close}
                    containerRef={schoolyear1searchDropDown.containerRef}
                    options={schoolyear1results}
                    loading={schoolyear1response.isFetching}
                    onSelect={handleSelectSchoolyear1}
                    renderOption={(option) => <div className="flex gap-x-2 items-center">
                      <div>{option.text}</div>
                    </div>}
                    placeholder="Rechercher..."
                    inputClassName="w-[200px]"
                  />
                ) : (
                  <div className="flex items-center justify-between border h-[38px] w-[200px] rounded-md px-3 py-2 bg-slate-50">
                    <span className="text-sm truncate">{schoolyear1Data?.text}</span>
                    <button
                      type="button"
                      onClick={() => setSchoolyear1("")}
                      className="text-xs text-red-500 hover:underline ml-2"
                    >
                      Changer
                    </button>
                  </div>
                )}
              </div>

              {/* semestre */}
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Semestre</label>
                <Filter
                  value={semester1}
                  onChange={(e) => setSemester1(e.target.value)}
                  otherOptions={[
                    { key: "Toutes", value: "" },
                  ]}
                  options={semester1results}
                  render={(value) => value.code}
                  className="w-[200px] h-[38px]"
                />
              </div>
            </div>
            <div className="border border-gray-200 mt-2"></div>
            {!canPromote ? <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
              Veuiller sélectionner tous les paramètres
            </div> :

              enrollments1loading ? (
                <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
                  Chargement...
                </div>
              )
                : enrollments1results.length !== 0 ? (
                  <>
                    <DataTable
                      data={enrollments1results}
                      columns={columns}
                      actions={actions1}
                      selectionMode={false}
                    />
                    <Paginator totalPages={totalPages1} page={page1} setPage={setPage1} />
                  </>
                ) : (
                  <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
                    Aucun résultat
                  </div>
                )}
            </div>

            <div className="mx-4 w-px bg-gray-200" aria-hidden="true" />

          {/* {nouvelle année scolaire} */}
          <div className="pl-2">
            <h1 className="ml-3 text-red-600 font-bold">ETUDIANT INSCRIT</h1>
            {/* filtres */}
            <div className="w-[500px] flex flex-wrap gap-2">
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Parcours</label>
                {!formation2Data ? (
                  <SearchWithDropdown
                    value={formation2searchDropDown.value}
                    onChange={formation2searchDropDown.onChange}
                    isOpen={formation2searchDropDown.isOpen}
                    close={formation2searchDropDown.close}
                    containerRef={formation2searchDropDown.containerRef}
                    options={formation2results}
                    loading={formation2response.isFetching}
                    onSelect={handleSelectFormation2}
                    renderOption={(option) => <div className="flex gap-x-2 items-center">
                      <div>{option.text}</div>
                    </div>}
                    placeholder="Rechercher..."
                    inputClassName="w-[200px]"
                  />
                ) : (
                  <div className="flex items-center justify-between border h-[38px] w-[200px] rounded-md px-3 py-2 bg-slate-50">
                    <span className="text-sm truncate">{formation2Data?.text}</span>
                    <button
                      type="button"
                      onClick={() => setFormation2("")}
                      className="text-xs text-red-500 hover:underline ml-2"
                    >
                      Changer
                    </button>
                  </div>
                )}
              </div>

              {/* SchoolYear */}
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Année Scolaire</label>
                {!schoolyear2Data ? (
                  <SearchWithDropdown
                    value={schoolyear2searchDropDown.value}
                    onChange={schoolyear2searchDropDown.onChange}
                    isOpen={schoolyear2searchDropDown.isOpen}
                    close={schoolyear2searchDropDown.close}
                    containerRef={schoolyear2searchDropDown.containerRef}
                    options={schoolyear2results}
                    loading={schoolyear2response.isFetching}
                    onSelect={handleSelectSchoolyear2}
                    renderOption={(option) => <div className="flex gap-x-2 items-center">
                      <div>{option.text}</div>
                    </div>}
                    placeholder="Rechercher..."
                    inputClassName="w-[200px]"
                  />
                ) : (
                  <div className="flex items-center justify-between border h-[38px] w-[200px] rounded-md px-3 py-2 bg-slate-50">
                    <span className="text-sm truncate">{schoolyear2Data?.text}</span>
                    <button
                      type="button"
                      onClick={() => setSchoolyear2("")}
                      className="text-xs text-red-500 hover:underline ml-2"
                    >
                      Changer
                    </button>
                  </div>
                )}
              </div>

              {/* semestre */}
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Semestre</label>
                <Filter
                  value={semester2}
                  onChange={(e) => setSemester2(e.target.value)}
                  otherOptions={[
                    { key: "Toutes", value: "" },
                  ]}
                  options={semester1results}
                  render={(value) => value.code}
                  className="w-[200px] h-[38px]"
                />
              </div>
            </div>
            <div className="border border-gray-200 mt-2"></div>
            {!canPromote ? <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
              Veuiller sélectionner tous les paramètres
            </div> :

              enrollments2loading ? (
                <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
                  Chargement...
                </div>
              )
                : enrollments2results.length !== 0 ? (
                  <>
                    <DataTable
                      data={enrollments2results}
                      columns={columns}
                      actions={actions2}
                      selectionMode={false}
                    />
                    <Paginator totalPages={totalPages2} page={page2} setPage={setPage2} />
                  </>
                ) : (
                  <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
                    Aucun résultat
                  </div>
                )}
          </div>
        </div>

      </Card>
    </>
  );
}
