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
import SearchWithDropdown from "../SearchWithDropdown"

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

  const { value: courseValue, query: courseQuery, onChange: courseOnChange, isOpen: courseIsOpen, close: courseClose, containerRef: courseContainerRef } = useSearchDropdown({ delay: 300, minChars: 1 });
  const { data: courseOptions, isFetching: isCourseFetching } = useCoursemodules(courseQuery ? { search: courseQuery } : null, !!courseQuery, 0);
  const courseOptionResults = courseOptions?.results || [];


  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    setForm(prev => ({ ...prev, course_module: course.id }));
    courseClose();
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
      <div className="flex gap-4">
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

      {/* COURSE MODULE */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Module de cours</label>
        {!selectedCourse ? (
          <SearchWithDropdown
            value={courseValue}
            onChange={courseOnChange}
            isOpen={courseIsOpen}
            close={courseClose}
            containerRef={courseContainerRef}
            options={courseOptionResults}
            loading={isCourseFetching}
            onSelect={handleSelectCourse}
            renderOption={(option) => <div className="flex gap-x-2 items-center">
              <div>{option.text || option.name}</div>
            </div>}
            inputClassName="w-full"
            placeholder="Rechercher un cours..."
          />
        ) : (
          <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-slate-50">
            <span className="text-sm">{selectedCourse.text || selectedCourse.name || `Cours #${form.course_module}`}</span>
            <button
              type="button"
              onClick={() => {
                setSelectedCourse(null);
                setForm(prev => ({ ...prev, course_module: "" }));
              }}
              className="text-xs text-red-500 hover:underline"
            >
              Changer
            </button>
          </div>
        )}
        {getError("course_module") && <span className="text-xs text-red-500">{getError("course_module")}</span>}
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

  const { search, page, setSearch, setPage, course, setCourse, school_year, setSchool_year: setSchoolYear, session, setSession } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page: { key: "page", type: "number", default: 1 },
    course: { key: "course_module", type: "string", default: "" },
    school_year: { key: "school_year", type: "string", default: "" },
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
      setSchoolYear(activeSy.id)
    }
  }, [activeSy])

  // Filters hooks
  const { value: courseValue, query: courseQuery, onChange: courseOnChange, isOpen: courseIsOpen, close: courseClose, containerRef: courseContainerRef } = useSearchDropdown({ delay: 300, minChars: 1 });
  const { data: courseOptions, isFetching: isCourseFetching } = useCoursemodules(courseQuery ? { search: courseQuery } : {}, courseQuery.length >= 1, 0);
  const courseOptionResults = courseOptions?.results || [];
  const { data: courseData } = useCoursemodule(course);

  const { value: syValue, query: syQuery, onChange: syOnChange, isOpen: syIsOpen, close: syClose, containerRef: syContainerRef } = useSearchDropdown({ delay: 300, minChars: 1 });
  const { data: syOptions, isFetching: isSyFetching } = useSchoolyears(syQuery ? { search: syQuery } : {}, {enabled:syQuery.length >= 1, staleTime:0});
  const syOptionResults = syOptions?.results || [];
  const { data: syData } = useSchoolyear(school_year);

  const togglePub = useToggleAssessmentPublication();

  const handleSelectCourse = (selectedCourse) => {
    setCourse(selectedCourse.id);
    courseClose();
  };

  const handleSelectSy = (selectedSy) => {
    setSchoolYear(selectedSy.id);
    syClose();
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
      ...(course && { course_module: course }),
      ...(school_year && { school_year: school_year }),
      ...(session && { session }),
      ...(page && { page }),
    };
  }, [debouncedSearch, page, course, school_year, session]);

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
  const canCreate = [ROLES.DEPARTMENT_HEAD, ROLES.DEPARTMENT_SECRETARY].includes(role) && basePermission

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
            {/* Course Module */}
            {!courseData ? (
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Cours</label>
                <SearchWithDropdown
                  value={courseValue}
                  onChange={courseOnChange}
                  isOpen={courseIsOpen}
                  close={courseClose}
                  containerRef={courseContainerRef}
                  options={courseOptionResults}
                  loading={isCourseFetching}
                  onSelect={handleSelectCourse}
                  renderOption={(option) => <div className="flex gap-x-2 items-center">
                    <div>{option.text || option.name}</div>
                  </div>}
                  placeholder="Rechercher..."
                  inputClassName="w-[200px]"
                />
              </div>
            ) : (
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Cours</label>
                <div className="flex items-center justify-between border h-[38px] w-[200px] rounded-md px-3 py-2 bg-slate-50">
                  <span className="text-sm truncate">{courseData?.text || courseData?.name}</span>
                  <button
                    type="button"
                    onClick={() => setCourse(null)}
                    className="text-xs text-red-500 hover:underline ml-2"
                  >
                    Changer
                  </button>
                </div>
              </div>
            )}

            {/* SchoolYear */}
            {!syData ? (
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Année Scolaire</label>
                <SearchWithDropdown
                  value={syValue}
                  onChange={syOnChange}
                  isOpen={syIsOpen}
                  close={syClose}
                  containerRef={syContainerRef}
                  options={syOptionResults}
                  loading={isSyFetching}
                  onSelect={handleSelectSy}
                  renderOption={(option) => <div className="flex gap-x-2 items-center">
                    <div>{option.text || option.label}</div>
                  </div>}
                  placeholder="Rechercher..."
                  inputClassName="w-[200px]"
                />
              </div>
            ) : (
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Année Scolaire</label>
                <div className="flex items-center justify-between border h-[38px] w-[200px] rounded-md px-3 py-2 bg-slate-50">
                  <span className="text-sm truncate">{syData?.text || syData?.label}</span>
                  <button
                    type="button"
                    onClick={() => setSchoolYear(null)}
                    className="text-xs text-red-500 hover:underline ml-2"
                  >
                    Changer
                  </button>
                </div>
              </div>
            )}

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
