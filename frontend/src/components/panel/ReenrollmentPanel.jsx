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
import { useSemester } from "../../hooks/semesters/useSemester"
import { useSearchDropdown } from "../../hooks/useSearchDropdown"
import SearchableSelect from "../SearchableSelect"
import Badge from "../Badge"
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

  const fdd = useSearchDropdown({ delay: 300, minChars: 1 });
  const sydd = useSearchDropdown({ delay: 300, minChars: 1 });
  const sdd = useSearchDropdown({ delay: 300, minChars: 1 });

  const [selectedFormation, setSelectedFormation] = useState(null);
  const [selectedSchoolyear, setSelectedSchoolyear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);

  // Charger les listes de sélection pour l'ajout
  const { data: syOptions, isFetching: syFetching } = useSchoolyears(isEdit ? null : { no_pagination: true, status: "OPEN", ...(sydd.query ? { search: sydd.query } : {}) }, { enabled: !isEdit && sydd.enabled });
  const { data: fOptions, isFetching: fFetching } = useFormations(isEdit ? null : { no_pagination: true, ...(fdd.query ? { search: fdd.query } : {}) }, { enabled: !isEdit && fdd.enabled });
  const { data: sOptions, isFetching: sFetching } = useSemesters(isEdit ? null : { no_pagination: true, ...(sdd.query ? { search: sdd.query } : {}) }, { enabled: !isEdit && sdd.enabled });
  
  const syOptionResults = syOptions?.results || syOptions || [];
  const fOptionResults = fOptions?.results || fOptions || [];
  const sOptionResults = sOptions?.results || sOptions || [];

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
              options={fOptionResults}
              renderOption={(option) => (
                <div className="flex gap-x-2 items-center">
                  <div>{option.text || option.code}</div>
                  {option.code && <Badge content={option.code} color="blue" />}
                </div>
              )}
              searchDropdownProps={fdd}
              loading={fFetching}
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
              options={syOptionResults}
              renderOption={(option) => (
                <div className="flex gap-x-2 items-center">
                  <div>{option.text || option.label || option.name}</div>
                  {option.code && <Badge content={option.code} color="blue" />}
                </div>
              )}
              searchDropdownProps={sydd}
              loading={syFetching}
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
              options={sOptionResults}
              renderOption={(option) => (
                <div className="flex gap-x-2 items-center">
                  <div>{option.code || option.order}</div>
                  {option.code && <Badge content={option.code} color="blue" />}
                </div>
              )}
              searchDropdownProps={sdd}
              loading={sFetching}
              placeholder="Rechercher un semestre"
              width="w-full"
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
    search, setSearch,
    page1, setPage1,
    formation1_id, setFormation1_id,
    semester1_id, setSemester1_id,
    schoolyear1_id, setSchoolyear1_id,
    page2, setPage2,
    formation2_id, setFormation2_id,
    semester2_id, setSemester2_id,
    schoolyear2_id, setSchoolyear2_id,
  } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page1: { key: "page1", type: "number", default: 1 },
    formation1_id: { key: "formation1_id", type: "number", default: "" },
    semester1_id: { key: "semester1_id", type: "number", default: "" },
    schoolyear1_id: { key: "schoolyear1_id", type: "number", default: "" },
    page2: { key: "page2", type: "number", default: 1 },
    formation2_id: { key: "formation2_id", type: "number", default: "" },
    semester2_id: { key: "semester2_id", type: "number", default: "" },
    schoolyear2_id: { key: "schoolyear2_id", type: "number", default: "" },
  });

  const fdd1 = useSearchDropdown({ delay: 300, minChars: 1 })
  const sydd1 = useSearchDropdown({ delay: 300, minChars: 1 })
  const sdd1 = useSearchDropdown({ delay: 300, minChars: 1 })
  const fdd2 = useSearchDropdown({ delay: 300, minChars: 1 })
  const sydd2 = useSearchDropdown({ delay: 300, minChars: 1 })
  const sdd2 = useSearchDropdown({ delay: 300, minChars: 1 })

  const { data: formation1Data } = useFormation(formation1_id)
  const { data: formation2Data } = useFormation(formation2_id)
  const { data: schoolyear1Data } = useSchoolyear(schoolyear1_id)
  const { data: schoolyear2Data } = useSchoolyear(schoolyear2_id)
  const { data: semester1Data } = useSemester(semester1_id)
  const { data: semester2Data } = useSemester(semester2_id)

  const { data: f1Data, isFetching: f1Fetching } = useFormations(fdd1.query ? { search: fdd1.query } : {}, { enabled: fdd1.enabled, staleTime: 0 })
  const { data: f2Data, isFetching: f2Fetching } = useFormations(fdd2.query ? { search: fdd2.query } : {}, { enabled: fdd2.enabled, staleTime: 0 })
  
  const { data: sy1Data, isFetching: sy1Fetching } = useSchoolyears(sydd1.query ? { search: sydd1.query, status: "CLOSED" } : { status: "CLOSED" }, { enabled: sydd1.enabled, staleTime: 0 })
  const { data: sy2Data, isFetching: sy2Fetching } = useSchoolyears(sydd2.query ? { search: sydd2.query, status: "OPEN" } : { status: "OPEN" }, { enabled: sydd2.enabled, staleTime: 0 })
  
  const { data: s1Data, isFetching: s1Fetching } = useSemesters(sdd1.query ? { search: sdd1.query, is_active: true } : { is_active: true }, { enabled: sdd1.enabled, staleTime: 0 })
  const { data: s2Data, isFetching: s2Fetching } = useSemesters(sdd2.query ? { search: sdd2.query, is_active: true } : { is_active: true }, { enabled: sdd2.enabled, staleTime: 0 })

  const formation1results = f1Data?.results || []
  const formation2results = f2Data?.results || []
  const schoolyear1results = sy1Data?.results || []
  const schoolyear2results = sy2Data?.results || []
  const semester1results = s1Data?.results || s1Data || []
  const semester2results = s2Data?.results || s2Data || []

  const filtersLoading = false

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
      ...(semester1_id && { semester: semester1_id }),
      ...(formation1_id && { formation: formation1_id }),
      ...(schoolyear1_id && { school_year: schoolyear1_id }),
      ...(schoolyear2_id && { exclude_year: schoolyear2_id })
    };
  }, [debouncedSearch, page1, semester1_id, formation1_id, schoolyear1_id, schoolyear2_id]);

  const filters2 = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(page2 && { page: page2 }),
      ...(semester2_id && { semester: semester2_id }),
      ...(formation2_id && { formation: formation2_id }),
      ...(schoolyear2_id && { school_year: schoolyear2_id }),
    };
  }, [debouncedSearch, page2, semester2_id, formation2_id, schoolyear2_id]);

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
    setFormation1_id(formation.id)
    fdd1.close()
  }
  const handleSelectSchoolyear1 = (schoolyear) => {
    setSchoolyear1_id(schoolyear.id)
    sydd1.close()
  }
  const handleSelectSemester1 = (semester) => {
    setSemester1_id(semester.id)
    sdd1.close()
  }
  const handleSelectFormation2 = (formation) => {
    setFormation2_id(formation.id)
    fdd2.close()
  }
  const handleSelectSchoolyear2 = (schoolyear) => {
    setSchoolyear2_id(schoolyear.id)
    sydd2.close()
  }
  const handleSelectSemester2 = (semester) => {
    setSemester2_id(semester.id)
    sdd2.close()
  }

  const canPromote = semester1_id && semester2_id && formation1Data && formation2Data && schoolyear1Data && schoolyear2Data
  const handleSelectEnrollment = (enrollment) => {

  }

  const handlePromote = async (enrollment) => {
    if (!canPromote) return
    try {
      await promote.mutateAsync({ student: enrollment.student.id, formation: formation2Data.id, school_year: schoolyear2Data.id, semester: semester2_id })

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
            <div className="w-[500px] flex flex-wrap gap-2 pl-2 items-end">
              <SearchableSelect
                label="Parcours"
                selectedValue={formation1Data}
                onSelect={handleSelectFormation1}
                onClear={() => setFormation1_id("")}
                options={formation1results}
                renderOption={(option) => (
                  <div className="flex gap-x-2 items-center">
                    <div>{option.text || option.code}</div>
                    {option.code && <Badge content={option.code} color="blue" />}
                  </div>
                )}
                searchDropdownProps={fdd1}
                loading={f1Fetching}
                placeholder="Rechercher un parcours"
                width="w-[200px]"
              />
              <SearchableSelect
                label="Année Scolaire (clôturée)"
                selectedValue={schoolyear1Data}
                onSelect={handleSelectSchoolyear1}
                onClear={() => setSchoolyear1_id("")}
                options={schoolyear1results}
                renderOption={(option) => (
                  <div className="flex gap-x-2 items-center">
                    <div>{option.text || option.label || option.name}</div>
                    {option.code && <Badge content={option.code} color="blue" />}
                  </div>
                )}
                searchDropdownProps={sydd1}
                loading={sy1Fetching}
                placeholder="Rechercher une année"
                width="w-[200px]"
              />
              <SearchableSelect
                label="Semestre"
                selectedValue={semester1Data}
                onSelect={handleSelectSemester1}
                onClear={() => setSemester1_id("")}
                options={semester1results}
                renderOption={(option) => (
                  <div className="flex gap-x-2 items-center">
                    <div>{option.code || option.order}</div>
                    {option.code && <Badge content={option.code} color="blue" />}
                  </div>
                )}
                searchDropdownProps={sdd1}
                loading={s1Fetching}
                placeholder="Rechercher un semestre"
                width="w-[200px]"
              />
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
            <div className="w-[500px] flex flex-wrap gap-2 items-end">
              <SearchableSelect
                label="Parcours"
                selectedValue={formation2Data}
                onSelect={handleSelectFormation2}
                onClear={() => setFormation2_id("")}
                options={formation2results}
                renderOption={(option) => (
                  <div className="flex gap-x-2 items-center">
                    <div>{option.text || option.code}</div>
                    {option.code && <Badge content={option.code} color="blue" />}
                  </div>
                )}
                searchDropdownProps={fdd2}
                loading={f2Fetching}
                placeholder="Rechercher un parcours"
                width="w-[200px]"
              />
              <SearchableSelect
                label="Année Scolaire (ouverte)"
                selectedValue={schoolyear2Data}
                onSelect={handleSelectSchoolyear2}
                onClear={() => setSchoolyear2_id("")}
                options={schoolyear2results}
                renderOption={(option) => (
                  <div className="flex gap-x-2 items-center">
                    <div>{option.text || option.label || option.name}</div>
                    {option.code && <Badge content={option.code} color="blue" />}
                  </div>
                )}
                searchDropdownProps={sydd2}
                loading={sy2Fetching}
                placeholder="Rechercher une année"
                width="w-[200px]"
              />
              <SearchableSelect
                label="Semestre"
                selectedValue={semester2Data}
                onSelect={handleSelectSemester2}
                onClear={() => setSemester2_id("")}
                options={semester2results}
                renderOption={(option) => (
                  <div className="flex gap-x-2 items-center">
                    <div>{option.code || option.order}</div>
                    {option.code && <Badge content={option.code} color="blue" />}
                  </div>
                )}
                searchDropdownProps={sdd2}
                loading={s2Fetching}
                placeholder="Rechercher un semestre"
                width="w-[200px]"
              />
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
