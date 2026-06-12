import { useState } from "react"
import { useFormations } from "../../hooks/formations/useFormations"
import { useSchoolyears } from "../../hooks/schoolyears/useSchoolyears"
import { useSemesters } from "../../hooks/semesters/useSemesters"
import { useSearchDropdown } from "../../hooks/useSearchDropdown"
import Card from "../ui/Card"
import Button from "../ui/Button"
import DownloadGradeGrid from "../gradeGridPDF"
import SearchableSelect from "../SearchableSelect"


function HistoryGradeGridPanel() {
    const [formation,setFormation] = useState(null)
    const [schoolyear,setSchoolyear] = useState(null)
    const [semester,setSemester] = useState(null)

    const fdd = useSearchDropdown({delay:300,minChars:1})
    const sydd = useSearchDropdown({delay:300,minChars:1})
    const sdd = useSearchDropdown({delay:300,minChars:1})

    const {data: fData,isFetching:fLoading} = useFormations({...(fdd.query ? {search:fdd.query} : {})},{enabled:fdd.enabled})
    const {data: syData,isFetching:syLoading} = useSchoolyears({...(sydd.query ? {search:sydd.query} : {})},{enabled:sydd.enabled})
    const {data: sData,isFetching:sLoading} = useSemesters({...(sdd.query ? {search:sdd.query} : {})},{enabled:sdd.enabled})

    
    const fOptions = fData?.results || []
    const syOptions = syData?.results || []
    const sOptions = sData?.results || []
    
    return (
        <Card className="flex-cols p-2 gap-2 items-center">
            <h1 className="font-bold text-center">Grille de note</h1>
            <div className="flex gap-2 justify-center">
                <SearchableSelect
                    label="Parcours"
                    selectedValue={formation}
                    onSelect={(s) => setFormation(s)}
                    onClear={() => setFormation(null)}
                    options={fOptions}
                    renderOption={(op) => op.text}
                    searchDropdownProps={fdd}
                    loading={fLoading}
                    placeholder="Rechercher un parcours"
                    width="w-[220px]"
                />
                <SearchableSelect
                    label="Semestre"
                    selectedValue={semester}
                    onSelect={(s) => setSemester(s)}
                    onClear={() => setSemester(null)}
                    options={sOptions}
                    renderOption={(op) => op.code}
                    searchDropdownProps={sdd}
                    loading={sLoading}
                    placeholder="Rechercher un semestre"
                    width="w-[220px]"
                />
                <SearchableSelect
                    label="Année scolaire"
                    selectedValue={schoolyear}
                    onSelect={(s) => setSchoolyear(s)}
                    onClear={() => setSchoolyear(null)}
                    options={syOptions}
                    renderOption={(op) => op.text}
                    searchDropdownProps={sydd}
                    loading={syLoading}
                    placeholder="Rechercher une Année"
                    width="w-[220px]"
                />
            </div>
            <div className="w-full flex justify-center mt-3 mb-3">
                <Button
                    variant="secondary"
                    onClick={() => { DownloadGradeGrid(formation, semester, schoolyear) }}
                    disabled={!formation || !schoolyear || !semester}
                >
                    Télécharger la grille de Note
                </Button>
            </div>
        </Card>
    )
}

export default HistoryGradeGridPanel