import { useState, useMemo, useEffect } from "react";
import Card from "../ui/Card";
import SearchInput from "../SearchInput";
import Button from "../ui/Button";
import DataTable from "../DataTable";
import useDebounced from "../../hooks/useDebounced";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../utils/constants";

import { useCoursemodulechoices } from "../../hooks/coursemodules/useCoursemoduleChoices";
import { useChooseCoursemodule } from "../../hooks/coursemodules/useChooseCoursemodule";

import { useQueryParams } from "../../hooks/useQueryParams";
import { useSearchDropdown } from "../../hooks/useSearchDropdown";
import SearchableSelect from "../SearchableSelect";

import { useFormations } from "../../hooks/formations/useFormations";
import { useFormation } from "../../hooks/formations/useFormation";
import { useSemesters } from "../../hooks/semesters/useSemesters";
import { useSemester } from "../../hooks/semesters/useSemester";
import Badge from "../Badge";
export default function CourseModuleChoicePanel() {
  const { role, user } = useAuth();

  // global setting
  const {
    search, setSearch,
    formation_id, setFormation_id,
    semester_id, setSemester_id,
  } = useQueryParams({
    search: { key: "choice_search", type: "string", default: "" },
    formation_id: { key: "formation_id", type: "number", default: "" },
    semester_id: { key: "semester_id", type: "number", default: "" },
  });
  const debouncedSearch = useDebounced(search);
  const [showFilters, setShowFilters] = useState(false);
  // end global setting

  // filter setting
  const fdd = useSearchDropdown({ delay: 300, minChars: 1 })
  const sdd = useSearchDropdown({ delay: 300, minChars: 1 })

  const { data: fData, isFetching: fLoading } = useFormations({ ...(fdd.query ? { search: fdd.query } : {}) }, { enabled: fdd.enabled })
  const { data: sData, isFetching: sLoading } = useSemesters({ ...(sdd.query ? { search: sdd.query } : {}) }, { enabled: sdd.enabled })

  const fOptions = fData?.results || []
  const sOptions = sData?.results || []

  const { data: formation } = useFormation(formation_id)
  const { data: semester } = useSemester(semester_id)

  const filters = useMemo(() => ({
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(formation_id && { formation: formation_id }),
    ...(semester_id && { semester: semester_id }),
  }), [debouncedSearch, formation_id, semester_id]);
  // end filter setting

  const { data, isLoading: isDataLoading } = useCoursemodulechoices(filters, role);
  const results = data?.results || [];
  const chooseMutation = useChooseCoursemodule();

  // action handlers
  const handleChoose = async (courseModule) => {
    try {
      const res = await chooseMutation.mutateAsync(courseModule.id);
      if (res && res.detail) {
        toast.success(res.detail);
      }
    } catch (error) {
      const msg = error.response?.data?.detail || "Erreur lors du changement de participation";
      toast.error(msg);
    }
  };
  // end action handlers

  const columns = [
    { header: "Code", key: "code" },
    { header: "Nom du cours", key: "text" },
    { header: "UE", key: "course_unit", render: (cu) => cu?.text || cu?.code || "—" },
    { header: "Semestre", key: "semester", render: (s) => s?.code || "—" },
    { header: "Enseignant Actuel", key: "teacher", render: (t) => t ? (t.first_name + " " + t.last_name) : "Aucun" },
  ];

  const actions = [
    {
      label: "Participer",
      handler: handleChoose,
      conditionRow: (row) => row.teacher?.id !== user?.id
    },
    {
      label: "Retirer ma participation",
      handler: handleChoose,
      conditionRow: (row) => row.teacher?.id === user?.id
    }
  ];

  if (role !== ROLES.TEACHER) {
    return null;
  }

  return (
    <Card className="mt-4">
      <div className="px-4 py-4 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-800">Choix des cours</h2>
          <Button variant="primary" onClick={() => setShowFilters(!showFilters)} className="ml-4">
            Filtres
          </Button>
        </div>
        <SearchInput
          placeholder="Rechercher un module"
          className="w-[250px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showFilters && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-4 items-end">
          <SearchableSelect
            label="Parcours"
            selectedValue={formation}
            onSelect={(s) => setFormation_id(s.id)}
            onClear={() => setFormation_id("")}
            options={fOptions}
            renderOption={(option) => (
              <div className="flex gap-x-2 items-center">
                <div>{option.text || option.code}</div>
                {option.code && <Badge content={option.code} color="blue" />}
              </div>
            )}
            searchDropdownProps={fdd}
            loading={fLoading}
            placeholder="Rechercher un parcours"
            width="w-[220px]"
          />
          <SearchableSelect
            label="Semestre"
            selectedValue={semester}
            onSelect={(s) => setSemester_id(s.id)}
            onClear={() => setSemester_id("")}
            options={sOptions}
            renderOption={(option) => (
              <div className="flex gap-x-2 items-center">
                <div>{option.code || option.order}</div>
                {option.code && <Badge content={option.code} color="blue" />}
              </div>
            )}
            searchDropdownProps={sdd}
            loading={sLoading}
            placeholder="Rechercher un semestre"
            width="w-[220px]"
          />
        </div>
      )}

      <div className="p-4">
        {isDataLoading ? (
          <div className="flex justify-center text-slate-500 text-sm items-center h-[200px]">
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
          <div className="flex justify-center text-slate-500 text-sm items-center h-[200px]">
            Aucun module disponible pour la sélection.
          </div>
        )}
      </div>
    </Card>
  );
}
