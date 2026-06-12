import Card from "../ui/Card"
import SearchInput from "../SearchInput"
import Button from "../ui/Button"
import DataTable from '../DataTable'
import { useMemo, useState, useEffect } from "react"
import useDebounced from '../../hooks/useDebounced'
import Paginator from '../Paginator'
import { PAGINATION_SIZE } from "../../utils/constants"
import { useModal } from '../../context/ModalContext'
import useDRFErrors from "../../hooks/useDRFError"
import { toast } from 'react-toastify'
import Badge from "../Badge"
import Filter from "../Filter"
import { useQueryParams } from "../../hooks/useQueryParams"
import { useNavigate } from 'react-router-dom'

import { useAssessments } from "../../hooks/assessments/useAssessments"
import { useCreateAssessment } from "../../hooks/assessments/useCreateAssessment"
import { useUpdateAssessment } from "../../hooks/assessments/useUpdateAssessment"
import { useDeleteAssessment } from "../../hooks/assessments/useDeleteAssessment"
import { useToggleAssessmentPublication } from "../../hooks/assessments/useToggleAssessmentPublication"

import { useSearchDropdown } from "../../hooks/useSearchDropdown"
import SearchableSelect from "../SearchableSelect"

import { useCoursemodules } from "../../hooks/coursemodules/useCoursemodules"
import { useCoursemodule } from "../../hooks/coursemodules/useCoursemodule"
import { useSchoolyears } from "../../hooks/schoolyears/useSchoolyears"
import { useSchoolyear } from "../../hooks/schoolyears/useSchoolyear"
import { ROLES } from "../../utils/constants"
import { useAuth } from "../../context/AuthContext"

function AddOrEditForm({ initialData = {}, onSuccess }) {
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    name: initialData.name || "",
    type: initialData.type || "",
    session: initialData.session || "NORMAL",
    location: initialData.location || "",
    grade_weight: initialData.grade_weight || 1,
    date: initialData.date || new Date().toISOString().split('T')[0],
    course_module: initialData.course_module || "",
  });

  const [selectedCourse, setSelectedCourse] = useState(initialData.course_module_details || null);

  const create = useCreateAssessment();
  const update = useUpdateAssessment();
  const { handleErrors, getError, clearErrors } = useDRFErrors();
  const [loading, setLoading] = useState(false);

  const cmdd = useSearchDropdown({ delay: 300, minChars: 1 });
  const { data: cmOptions, isFetching: cmFetching } = useCoursemodules(cmdd.query ? { search: cmdd.query } : {}, { enabled: cmdd.enabled });
  const cmOptionResults = cmOptions?.results || [];


  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setForm(prev => ({ ...prev, course_module: course.id }));
    cmdd.close();
  };

  const handleChange = (e) => {
    clearErrors();
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.type || !form.course_module) return;

    setLoading(true);
    try {
      if (isEdit) {
        await update.mutateAsync(
          { id: initialData.id, data: form },
          { onSuccess: () => onSuccess?.() }
        );
      } else {
        await create.mutateAsync(form, {
          onSuccess: () => {
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

      {/* COURSE MODULE */}
      <div className="flex flex-col gap-1">
        <SearchableSelect
          label="Module de cours"
          selectedValue={selectedCourse}
          onSelect={handleSelectCourse}
          onClear={() => {
            setSelectedCourse(null);
            setForm(prev => ({ ...prev, course_module: "" }));
          }}
          options={cmOptionResults}
          renderOption={(option) => <div className="flex gap-x-2 items-center">
            <div>{option.text || option.name}</div>
          </div>}
          renderSelected={(selected) => selected?.text || selected?.name || `Cours #${form.course_module}`}
          searchDropdownProps={cmdd}
          loading={cmFetching}
          placeholder="Rechercher un cours..."
          width="w-full"
        />
        {getError("course_module") && <span className="text-xs text-red-500">{getError("course_module")}</span>}
      </div>

      {/* NAME */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Nom de l'examen</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex : Examen final"
        />
        {getError("name") && <span className="text-xs text-red-500">{getError("name")}</span>}
      </div>

      {/* TYPE */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Type</label>
        <input
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex : CC, Partiel, TP..."
        />
        {getError("type") && <span className="text-xs text-red-500">{getError("type")}</span>}
      </div>

      {/* SESSION & WEIGHT */}
      <div className="flex gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-slate-600">Session</label>
          <select
            name="session"
            value={form.session}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="NORMAL">Normale</option>
            <option value="RETAKE">Rattrapage</option>
          </select>
          {getError("session") && <span className="text-xs text-red-500">{getError("session")}</span>}
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-slate-600">Poids (1-100)</label>
          <input
            name="grade_weight"
            type="number"
            min="1"
            max="100"
            value={form.grade_weight}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
          {getError("grade_weight") && <span className="text-xs text-red-500">{getError("grade_weight")}</span>}
        </div>
      </div>

      {/* DATE & LOCATION */}
      <div className="flex gap-4 mb-16">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-slate-600">Date</label>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
          {getError("date") && <span className="text-xs text-red-500">{getError("date")}</span>}
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-slate-600">Lieu</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Ex : Amphi 1"
          />
          {getError("location") && <span className="text-xs text-red-500">{getError("location")}</span>}
        </div>
      </div>

      {getError("non_field_errors") && <div className="text-sm text-red-500">{getError("non_field_errors")}</div>}
      {getError("detail") && <div className="text-sm text-red-500">{getError("detail")}</div>}

      <div className="flex justify-end mt-2">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Enregistrement..." : isEdit ? "Modifier" : "Créer"}
        </Button>
      </div>
    </form>
  );
}

function DeleteConfirm({ Data, onSuccess }) {
  const destroy = useDeleteAssessment();
  const [loading, setLoading] = useState(false);
  const { handleErrors, getError } = useDRFErrors();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await destroy.mutateAsync(Data.id);
    } catch (error) {
      handleErrors(error);
      const msg = getError("detail") || "Une erreur est survenue";
      toast.error(msg);
    } finally {
      setLoading(false);
      onSuccess?.();
    }
  };

  return (
    <div>
      <p>Voulez-vous supprimer l'examen <strong>{Data.name}</strong> ?</p>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleConfirm} disabled={loading} className="bg-red-500 text-white hover:bg-red-600">
          {loading ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </div>
  );
}

export default function AssessmentsPanel() {
  const { openModal, closeModal } = useModal();
  const { role } = useAuth();
  const navigate = useNavigate();

  const { search, page, setSearch, setPage, course_module_id, setCourse_module_id, school_year_id, setSchool_year_id, session, setSession } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page: { key: "page", type: "number", default: 1 },
    course_module_id: { key: "course_module", type: "string", default: "" },
    school_year_id: { key: "school_year_id", type: "number", default: "" },
    session: { key: "session", type: "string", default: "" },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("page")) setPage(1);
  }, []);

  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounced(search);

  const { data: activeSys } = useSchoolyears({ status: "ACTIVE" })
  const activeSy = activeSys?.results?.[0] || null
  useEffect(() => {
    if (activeSy) {
      setSchool_year_id(activeSy.id)
    }
  }, [activeSy])

  // Filters hooks
  const cmdd = useSearchDropdown({ delay: 300, minChars: 1 });
  const { data: cmOptions, isFetching: cmFetching } = useCoursemodules(cmdd.query ? { search: cmdd.query } : {}, { enabled: cmdd.enabled });
  const cmOptionResults = cmOptions?.results || [];
  const { data: course_module } = useCoursemodule(course_module_id);

  const sydd = useSearchDropdown({ delay: 300, minChars: 1 });
  const { data: syOptions, isFetching: syFetching } = useSchoolyears(sydd.query ? { search: sydd.query } : {}, { enabled: sydd.enabled });
  const syOptionResults = syOptions?.results || [];
  const { data: school_year } = useSchoolyear(school_year_id);

  const togglePub = useToggleAssessmentPublication();

  const handleSelectCourse = (c) => {
    setCourse_module_id(c.id);
    cmdd.close();
  };

  const handleSelectSy = (sy) => {
    setSchool_year_id(sy.id);
    sydd.close();
  };

  const handleTogglePublication = async (id) => {
    try {
      await togglePub.mutateAsync(id);
      toast.success("Statut de publication mis à jour");
    } catch (e) {
      const msg = e.response.data.detail || "Erreur lors de la mise à jour";
      toast.error(msg);
    }
  };

  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(course_module_id && { course_module: course_module_id }),
      ...(school_year_id && { school_year: school_year_id }),
      ...(session && { session }),
      ...(page && { page }),
    };
  }, [debouncedSearch, page, course_module_id, school_year_id, session]);

  const { data, isLoading: isDataLoading } = useAssessments(filters);
  const results = data?.results || [];
  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / PAGINATION_SIZE));

  const columns = [
    { header: "Nom", key: "name" },
    { header: "Type", key: "type" },
    {
      header: "Session", key: "session",
      render: (val) => val === "NORMAL" ? <Badge content="Normale" color="blue" /> : <Badge content="Rattrapage" color="yellow" />
    },
    { header: "Date", key: "date" },
    { header: "Lieu", key: "location" },
    { header: "Poids", key: "grade_weight" },
    {
      header: "Publié", key: "is_published",
      render: (val) => val ? <Badge content="Oui" color="green" /> : <Badge content="Non" color="gray" />
    }
  ];

  const basePermission = activeSy !== null
  const canCreate = [ROLES.DEPARTMENT_HEAD, ROLES.DEPARTMENT_SECRETARY, ROLES.TEACHER].includes(role) && basePermission

  const actions = [
    {
      label: "Modifier",
      handler: (row) => openModal({ title: "Modifier l'examen", content: <AddOrEditForm initialData={row} onSuccess={closeModal} /> }),
      conditionGlobal: canCreate
    },
    {
      label: "Supprimer",
      handler: (row) => openModal({ title: `Supprimer ${row.name}`, content: <DeleteConfirm Data={row} onSuccess={closeModal} /> }),
      conditionGlobal: canCreate
    },
    {
      label: "Dépublier",
      handler: (row) => handleTogglePublication(row.id),
      conditionRow: (row) => row.is_published === true,
      conditionGlobal: canCreate
    },
    {
      label: "Publier",
      handler: (row) => handleTogglePublication(row.id),
      conditionRow: (row) => row.is_published === false,
      conditionGlobal: canCreate

    },
    {
      label: "Voir notes",
      handler: (row) => {
        navigate(`?assessment=${row.id}`);
      },
    }
  ];

  return (
    <Card>
      <div className="px-2 py-2 flex justify-between">
        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={() => setShowFilters(!showFilters)}>
            Filtres
          </Button>
        </div>
        <SearchInput
          placeholder="Rechercher..."
          className="w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {canCreate && (
          <Button variant="primary" onClick={() => openModal({ title: "Ajouter un examen", content: <AddOrEditForm onSuccess={closeModal} /> })}>
            + ajouter
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="ml-2 mb-2">
          <div className="flex flex-wrap gap-4 border-b pb-4 mb-2 border-slate-200">
            <SearchableSelect
              label="Cours"
              selectedValue={course_module}
              onSelect={handleSelectCourse}
              onClear={() => setCourse_module_id("")}
              options={cmOptionResults}
              renderOption={(option) => (
                <div className="flex gap-x-2 items-center">
                  <div>{option.text || option.name}</div>
                  {option.code && <Badge content={option.code} color="blue" />}
                </div>
              )}
              renderSelected={(selected) => selected?.text || selected?.name}
              searchDropdownProps={cmdd}
              loading={cmFetching}
              placeholder="Rechercher..."
              width="w-[200px]"
            />

            <SearchableSelect
              label="Année scolaire"
              selectedValue={school_year}
              onSelect={handleSelectSy}
              onClear={() => setSchool_year_id("")}
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
              width="w-[200px]"
            />

            {/* Session */}
            <div>
              <label className="text-slate-600 text-sm font-bold block mb-1">Session</label>
              <Filter
                value={session}
                onChange={(e) => setSession(e.target.value)}
                otherOptions={[
                  { key: "Toutes", value: "" },
                  { key: "Normale", value: "NORMAL" },
                  { key: "Rattrapage", value: "RETAKE" }
                ]}
                className="w-[200px] h-[38px]"
              />
            </div>
          </div>
        </div>
      )}

      {isDataLoading ? (
        <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
          Chargement...
        </div>
      ) : results.length !== 0 ? (
        <DataTable
          data={results}
          columns={columns}
          actions={actions}
          selectionMode={false}
        />
      ) : (
        <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
          Aucun résultat
        </div>
      )}

      <Paginator
        totalPages={totalPages}
        page={page}
        setPage={setPage}
      />
    </Card>
  );
}
