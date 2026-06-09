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

import { useEnrollments } from "../../hooks/enrollments/useEnrollments"
import { useDeleteEnrollment} from '../../hooks/enrollments/useDeleteEnrollment'

import { useSearchDropdown } from "../../hooks/useSearchDropdown"
import SearchWithDropdown from "../SearchWithDropdown"

import { useSchoolyears } from "../../hooks/schoolyears/useSchoolyears"
import { useFormations } from "../../hooks/formations/useFormations"
import { useFormation } from "../../hooks/formations/useFormation"
import { useSchoolyear } from "../../hooks/schoolyears/useSchoolyear"
import { useSemesters } from "../../hooks/semesters/useSemesters"
import { useSelected } from "../../context/SelectedContext"


function DeleteConfirm({ Data, onSuccess }) {
  const destroy = useDeleteEnrollment();
  const { handleErrors, getError ,errors,clearErrors} = useDRFErrors();

  const handleConfirm = async () => {
    try {
      await destroy.mutateAsync(Data.id);
    } catch (error) {
      const msg = error.response.data.detail || "Une erreur est survenue";
      toast.error(msg);
    } finally {
      onSuccess?.();
    }
  };

  return (
    <div>
      <p>Voulez-vous supprimer l'inscription  de <strong>{Data.student.first_name} {Data.student.last_name} en {Data.formation.text} {Data.semester.code} de l'année {Data.school_year.text}</strong> ?</p>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleConfirm} disabled={destroy.isPending} className="bg-red-500 text-white hover:bg-red-600">
          {destroy.isPending ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </div>
  );
}

export default function HistoryPanel({enrollment, setEnrollment}) {
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();

  const { search, page, setSearch, setPage, school_year: schoolyear, setSchool_year: setSchoolYear, formation, setFormation, semester, setSemester, status, setStatus } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page: { key: "page", type: "number", default: 1 },
    school_year: { key: "school_year", type: "string", default: "" },
    formation: { key: "formation", type: "string", default: "" },
    semester: { key: "semester", type: "string", default: "" },
    status: { key: "status", type: "string", default: "" },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("page")) setPage(1);
  }, []);

  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounced(search);

  // Filters hooks
  const { value: formationValue, query: formationQuery, onChange: formationOnChange, isOpen: formationIsOpen, close: formationClose, containerRef: formationContainerRef } = useSearchDropdown({ delay: 300, minChars: 1 });
  const { data: formationOptions, isFetching: isFormationFetching } = useFormations(formationQuery ? { search: formationQuery } : {}, {enabled:formationQuery.length >= 1, staleTime:0});
  const formationOptionResults = formationOptions?.results || [];
  const { data: formationData } = useFormation(formation);

  const { value: syValue, query: syQuery, onChange: syOnChange, isOpen: syIsOpen, close: syClose, containerRef: syContainerRef } = useSearchDropdown({ delay: 300, minChars: 1 });
  const { data: syOptions, isFetching: isSyFetching } = useSchoolyears(syQuery ? { search: syQuery } : {}, {enabled:syQuery.length >= 1, staleTime:0});
  const syOptionResults = syOptions?.results || [];
  const { data: syData } = useSchoolyear(schoolyear);

  const { data: semesterOptions, isSemesterFetching } = useSemesters({ no_pagination: true })
  const semesterOptionResults = semesterOptions || []

  const handleSelectFormation = (selectedFormation) => {
    setFormation(selectedFormation.id);
    formationClose();
  };

  const handleSelectSy = (selectedSy) => {
    setSchoolYear(selectedSy.id);
    syClose();
  };

  const handleSelectEnrollment = (selectedEnrollment) => {
    const enrollmentId = selectedEnrollment?.[0]?.id || ""
    setEnrollment(enrollmentId);
  }

  const handleDelete = (enrollment) => {
    openModal({ title: `Supprimer l'inscription`, content: <DeleteConfirm Data={enrollment} onSuccess={() => {
      closeModal()
      setEnrollment("")
    }} /> })
  }

  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(formation && { formation: formation }),
      ...(schoolyear && { school_year: schoolyear }),
      ...(semester && { semester }),
      ...(status && { status }),
      ...(page && { page }),
    };
  }, [debouncedSearch, page, formation, schoolyear, status, semester]);

  const { data, isLoading: isDataLoading } = useEnrollments(filters);
  const results = data?.results || [];
  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / PAGINATION_SIZE));

  const columns = [
    {
      header: "Etudiants", key: "student",
      render: (student) => student.first_name || student.last_name ? `${student.first_name} ${student.last_name}` : "-"
    },
    {
      header: "Parcours", key: "formation",
      render: (formation) => formation.text
    },
    {
      header: "Semestres", key: "semester",
      render: (semester) => semester.code
    },
    {
      header: "Année", key: "school_year",
      render: (sy) => sy.text
    },
    { header: "Statut", key: "status" ,render : (val) => val == "VALIDATED"? "Validé" : val == "NOT_VALIDATED" ? "Non Validé" : "Active" },
  ];

  const actions = [
    {
      label: "Supprimer",
      handler: handleDelete
    },
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
      </div>

      {showFilters && (
        <div className="ml-2 mb-2">
          <div className="flex flex-wrap gap-4 border-b pb-4 mb-2 border-slate-200">
            {/* Parcours */}
            <div>
              <label className="text-slate-600 text-sm font-bold block mb-1">Parcours</label>
              {!formationData ? (
                <SearchWithDropdown
                  value={formationValue}
                  onChange={formationOnChange}
                  isOpen={formationIsOpen}
                  close={formationClose}
                  containerRef={formationContainerRef}
                  options={formationOptionResults}
                  loading={isFormationFetching}
                  onSelect={handleSelectFormation}
                  renderOption={(option) => <div className="flex gap-x-2 items-center">
                    <div>{option.text || option.name}</div>
                  </div>}
                  placeholder="Rechercher..."
                  inputClassName="w-[200px]"
                />
              ) : (
                <div className="flex items-center justify-between border h-[38px] w-[200px] rounded-md px-3 py-2 bg-slate-50">
                  <span className="text-sm truncate">{formationData?.text}</span>
                  <button
                    type="button"
                    onClick={() => setFormation(null)}
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
              {!syData ? (
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
              ) : (
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
              )}
            </div>

            {/* semestre */}
            <div>
              <label className="text-slate-600 text-sm font-bold block mb-1">Semestre</label>
              <Filter
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                otherOptions={[
                  { key: "Toutes", value: "" },
                ]}
                options={semesterOptionResults}
                render={(value) => value.code}
                className="w-[200px] h-[38px]"
              />
            </div>

            {/* status */}
            <div>
              <label className="text-slate-600 text-sm font-bold block mb-1">Statut</label>
              <Filter
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                otherOptions={[
                  { key: "Tous", value: "" },
                  { key: "Actif", value: "ACTIVE" },
                  { key: "Validé", value: "VALIDATED" },
                  { key: "Non Validé", value: "NOT_VALIDATED" },
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
          selectionMode={"single"}
          onSelectionChange={handleSelectEnrollment}
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
