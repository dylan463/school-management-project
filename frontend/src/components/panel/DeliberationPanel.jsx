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
import { useSearchDropdown } from "../../hooks/useSearchDropdown"
import SearchableSelect from "../SearchableSelect"
import { useQueryParams } from "../../hooks/useQueryParams"
import { useNavigate } from 'react-router-dom'

import { useEnrollments } from "../../hooks/enrollments/useEnrollments"

import { useSchoolyears } from "../../hooks/schoolyears/useSchoolyears"
import { useSchoolyear } from "../../hooks/schoolyears/useSchoolyear"
import { useFormations } from "../../hooks/formations/useFormations"
import { useFormation } from "../../hooks/formations/useFormation"
import { useSemesters } from "../../hooks/semesters/useSemesters"
import { useSemester } from "../../hooks/semesters/useSemester"
import { useSelected } from "../../context/SelectedContext"
import Switch from "../Switch"
import { useChangeEnrollmentStatus } from "../../hooks/enrollments/useChangeEnrollmentStatus"



export default function DeliberationPanel({enrollment, setEnrollment}) {
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();

  const { search, page, setSearch, setPage, school_year: schoolyear, formation_id, setFormation_id, semester_id, setSemester_id, status, setStatus } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page: { key: "page", type: "number", default: 1 },
    formation_id: { key: "formation_id", type: "number", default: "" },
    semester_id: { key: "semester_id", type: "number", default: "" },
    status: { key: "status", type: "string", default: "NOT_DELIBERATED" },
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
  const fdd = useSearchDropdown({ delay: 300, minChars: 1 });
  const { data: fOptions, isFetching: fFetching } = useFormations(fdd.query ? { search: fdd.query } : {}, { enabled: fdd.enabled, staleTime: 0 });
  const fOptionResults = fOptions?.results || [];
  const { data: formation } = useFormation(formation_id);

  const sdd = useSearchDropdown({ delay: 300, minChars: 1 })
  const { data: semester } = useSemester(semester_id)
  const { data: sOptions, isFetching: sFetching } = useSemesters(sdd.query ? { search: sdd.query } : {}, { enabled: sdd.enabled, staleTime: 0 })
  const sOptionResults = sOptions?.results || sOptions || []

  const { data: activeSyData } = useSchoolyears({ status: "ACTIVE", no_pagination: true })
  const activeSy = activeSyData?.[0] || null

  const handleSelectFormation = (f) => {
    setFormation_id(f.id);
    fdd.close();
  };

  const handleSelectSemester = (s) => {
    setSemester_id(s.id);
    sdd.close();
  };

  const handleSelectEnrollment = (selectedEnrollment) => {
    const enrollmentId = selectedEnrollment?.[0]?.id || ""
    setEnrollment(enrollmentId);
  }

  const handleCancel = (enrollment) => {
    changeEnrollmentStatusMutation.mutate({ id: enrollment.id, data: { status: "ACTIVE" } }, {
    onSuccess: () => {
      toast.success("Inscription annulée avec succès")
    },
    onError: (error) => {
      toast.error("Erreur lors de l'annulation de l'inscription")
    }
    })
    setEnrollment('')
  }

  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(formation_id && { formation: formation_id }),
      ...(semester_id && { semester: semester_id }),
      ...(status && { status }),
      ...(page && { page }),
    };
  }, [debouncedSearch, page, formation_id, schoolyear, status, semester_id]);

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
      handler: handleCancel,
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
              <SearchableSelect
                label="Parcours"
                selectedValue={formation}
                onSelect={handleSelectFormation}
                onClear={() => setFormation_id("")}
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
                width="w-[200px]"
              />

              <SearchableSelect
                label="Semestre"
                selectedValue={semester}
                onSelect={handleSelectSemester}
                onClear={() => setSemester_id("")}
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
                width="w-[200px]"
              />
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
