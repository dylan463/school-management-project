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
import SearchWithDropdown from "../SearchWithDropdown";
import Filter from "../Filter";

import { useFormations } from "../../hooks/formations/useFormations";
import { useFormation } from "../../hooks/formations/useFormation";
import { useSemesters } from "../../hooks/semesters/useSemesters";

export default function CourseModuleChoicePanel() {
  const { role, user } = useAuth();

  const {
    search, setSearch,
    formation, setFormation,
    semester, setSemester,
  } = useQueryParams({
    search: { key: "choice_search", type: "string", default: "" },
    formation: { key: "choice_formation", type: "string", default: "" },
    semester: { key: "choice_semester", type: "string", default: "" },
  });

  const debouncedSearch = useDebounced(search);
  const [showFilters, setShowFilters] = useState(false);

  // ── Filtre : Formation search dropdown ──
  const formationDropdown = useSearchDropdown({ delay: 300, minChars: 1 });
  const { data: formationsOptions, isFetching: isFormationsFetching } = useFormations(
    formationDropdown.query ? { search: formationDropdown.query } : {},
    formationDropdown.query.length >= 1
  );
  const formationOptionResults = formationsOptions?.results || formationsOptions || [];
  const { data: selectedFormationData } = useFormation(formation);

  // ── Filtre : Semestres ──
  const { data: semesterData } = useSemesters({ no_pagination: true });
  const semesters = semesterData?.results || semesterData || [];

  const filters = useMemo(() => ({
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(formation && { formation }),
    ...(semester && { semester }),
  }), [debouncedSearch, formation, semester]);

  const { data, isLoading: isDataLoading } = useCoursemodulechoices(filters, role);
  const results = data?.results || data || [];

  const chooseMutation = useChooseCoursemodule();

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
    return null; // Only visible for teachers
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
          {/* Filtre Formation */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-600 font-bold text-sm">Parcours (Formation)</label>
            {!selectedFormationData ? (
              <SearchWithDropdown
                value={formationDropdown.value}
                onChange={formationDropdown.onChange}
                isOpen={formationDropdown.isOpen}
                close={formationDropdown.close}
                containerRef={formationDropdown.containerRef}
                options={formationOptionResults}
                loading={isFormationsFetching}
                onSelect={(f) => { setFormation(f.id); formationDropdown.close() }}
                renderOption={(option) => (
                  <div className="flex gap-x-2 items-center">
                    <div>{option.text || option.code}</div>
                  </div>
                )}
                placeholder="Rechercher un parcours"
                inputClassName="w-[220px]"
              />
            ) : (
              <div className="flex items-center justify-between border h-[38px] w-[220px] rounded-md px-3 py-2 bg-white">
                <span className="text-sm truncate">{selectedFormationData?.text || selectedFormationData?.code}</span>
                <button
                  type="button"
                  onClick={() => setFormation("")}
                  className="text-xs text-red-500 hover:underline ml-2"
                >
                  Changer
                </button>
              </div>
            )}
          </div>

          {/* Filtre Semestre */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-600 font-bold text-sm">Semestre</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="border rounded-md px-3 py-2 h-[38px] outline-none focus:ring-2 focus:ring-red-500 bg-white text-sm w-[180px]"
            >
              <option value="">Tous</option>
              {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.code || s.order}</option>
              ))}
            </select>
          </div>
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
