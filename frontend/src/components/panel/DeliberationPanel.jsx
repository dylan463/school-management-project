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

import { useSearchDropdown } from "../../hooks/useSearchDropdown"
import SearchWithDropdown from "../SearchWithDropdown"

import { useSchoolyears } from "../../hooks/schoolyears/useSchoolyears"
import { useSchoolyear } from "../../hooks/schoolyears/useSchoolyear"
import { useFormations } from "../../hooks/formations/useFormations"
import { useFormation } from "../../hooks/formations/useFormation"
import { useSemesters } from "../../hooks/semesters/useSemesters"
import { useSelected } from "../../context/SelectedContext"
import Switch from "../Switch"
import { useChangeEnrollmentStatus } from "../../hooks/enrollments/useChangeEnrollmentStatus"



export default function DeliberationPanel() {
  const { openModal, closeModal } = useModal();
  const { selected: SelectedEnrollment, setSelected: setSelectedEnrollment } = useSelected()
  const navigate = useNavigate();

  const { search, page, setSearch, setPage, school_year: schoolyear, formation, setFormation, semester, enrollment, setEnrollment, setSemester, status, setStatus } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page: { key: "page", type: "number", default: 1 },
    formation: { key: "formation", type: "string", default: "" },
    semester: { key: "semester", type: "string", default: "" },
    status: { key: "status", type: "string", default: "NOT_DELIBERATED" },
    enrollment: { key: "enrollment", type: "string", default: "" },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("page")) setPage(1);
    if (!params.get("status")) setStatus("NOT_DELIBERATED")
  }, []);

  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounced(search);

  const changeEnrollmentStatusMutation = useChangeEnrollmentStatus();

  // Filters hooks
  const { value: formationValue, query: formationQuery, onChange: formationOnChange, isOpen: formationIsOpen, close: formationClose, containerRef: formationContainerRef } = useSearchDropdown({ delay: 300, minChars: 1 });
  const { data: formationOptions, isFetching: isFormationFetching } = useFormations(formationQuery ? { search: formationQuery } : {}, formationQuery.length >= 1, 0);
  const formationOptionResults = formationOptions?.results || [];
  const { data: formationData } = useFormation(formation);

  const { data: semesterOptions, isSemesterFetching } = useSemesters({ no_pagination: true })
  const semesterOptionResults = semesterOptions || []

  const { data: activeSyData } = useSchoolyears({ status: "ACTIVE", no_pagination: true })
  const activeSy = activeSyData?.[0] || null

  const handleSelectFormation = (selectedFormation) => {
    setFormation(selectedFormation.id);
    formationClose();
  };

  const handleSelectEnrollment = (selectedEnrollment) => {
    const enrollmentId = selectedEnrollment?.[0]?.id || ""
    setEnrollment(enrollmentId);
    setSelectedEnrollment(enrollmentId)
  }

  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(formation && { formation: formation }),
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
      label: "Annuler",
      handler: (row) => changeEnrollmentStatusMutation.mutate({ id: row.id, data: { status: "ACTIVE" } }, {
        onSuccess: () => {
          toast.success("Inscription annulée avec succès")
        },
        onError: (error) => {
          toast.error("Erreur lors de l'annulation de l'inscription")
        }
      }),
      conditionGlobal: status == "DELIBERATED" && !!activeSy
    },
  ];

  const statusTabs = [
    { key: "Non Délibéré", value: "NOT_DELIBERATED" },
    { key: "Délibéré", value: "DELIBERATED" },
  ]



  return (
    <div>
      <Card className="p-4 mb-4">
        {activeSy ? `Année scolaire active : ${activeSy.text}` : "Aucune année scolaire active"}
      </Card>
      <Card>
        <div className="px-2 py-2 flex justify-between">
          <div className="flex items-center gap-2">
            <Switch
              tabs={statusTabs}
              active={status}
              onChange={(value) => setStatus(value)}
            />
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
                    <span className="text-sm truncate">{formationData?.text || formationData?.name}</span>
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
            selectionMode={activeSy ? "single" : false}
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
    </div>
  );
}
