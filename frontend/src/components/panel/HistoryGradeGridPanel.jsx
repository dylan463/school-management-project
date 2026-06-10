import { useState } from "react"
import { useFormations } from "../../hooks/formations/useFormations"
import { useSchoolyears } from "../../hooks/schoolyears/useSchoolyears"
import { useSemesters } from "../../hooks/semesters/useSemesters"
import { useSearchDropdown } from "../../hooks/useSearchDropdown"
import SearchWithDropdown from "../SearchWithDropdown"
import Card from "../ui/Card"
import Button from "../ui/Button"
import DownloadGradeGrid from "../gradeGridPDF"


function HistoryGradeGridPanel() {
    const [formation,setFormation] = useState(null)
    const [schoolyear,setSchoolyear] = useState(null)
    const [semester,setSemester] = useState(null)

    const fdd = useSearchDropdown({delay:300,minChars:1})
    const sydd = useSearchDropdown({delay:300,minChars:1})
    const sdd = useSearchDropdown({delay:300,minChars:1})

    const {data: fData,isFetching:fLoading} = useFormations({...(fdd.query && {search:fdd.query})},{enabled:fdd.query.length > 0,staleTime:5*60*100})
    const {data: syData,isFetching:syLoading} = useSchoolyears({...(sydd.query && {search:sydd.query})},{enabled:sydd.query.length > 0,staleTime:5*60*100})
    const {data: sData,isFetching:sLoading} = useSemesters({...(sdd.query && {search:sdd.query})},{enabled:sdd.query.length > 0,staleTime:5*60*100})

    
    const fOptions = fData?.results || []
    const syOptions = syData?.results || []
    const sOptions = sData?.results || []
    
    return (
        <Card className="flex-cols p-2 gap-2 items-center">
            <h1 className="font-bold text-center">Grille de note</h1>
            <div className="flex gap-2 justify-center">
                <div>
                    <label className="text-slate-600 font-bold text-sm">Parcours</label>
                    {!formation ? <SearchWithDropdown 
                    {...fdd}
                    options={fOptions}
                    onSelect={(s) => setFormation(s)}
                    renderOption={(op)=> op.text}
                    loading={fLoading}
                    placeholder="Rechercher un parcours"
                    inputClassName="w-[220px]"
                    />:
                    <div className="flex items-center justify-between border h-[38px] w-[220px] rounded-md px-3 py-2 bg-white">
                        <span className="text-sm truncate">{formation?.text || formation?.code}</span>
                        <button
                        type="button"
                        onClick={() => setFormation(null)}
                        className="text-xs text-red-500 hover:underline ml-2"
                        >
                        Changer
                        </button>
                    </div>
                    }
                </div>
                <div>
                    <label className="text-slate-600 font-bold text-sm">Semestre</label>
                    {!semester ? <SearchWithDropdown 
                    {...sdd}
                    options={sOptions}
                    onSelect={(s) => setSemester(s)}
                    renderOption={(op)=> op.code}
                    loading={sLoading}
                    placeholder="Rechercher un semestre"
                    inputClassName="w-[220px]"
                    />:
                    <div className="flex items-center justify-between border h-[38px] w-[220px] rounded-md px-3 py-2 bg-white">
                        <span className="text-sm truncate">{semester?.text || semester?.code}</span>
                        <button
                        type="button"
                        onClick={() => setSemester(null)}
                        className="text-xs text-red-500 hover:underline ml-2"
                        >
                        Changer
                        </button>
                    </div>
                    }
                </div>
                <div>
                    <label className="text-slate-600 font-bold text-sm">Année scolaire</label>
                    {!schoolyear ? <SearchWithDropdown 
                    {...sydd}
                    options={syOptions}
                    onSelect={(s) => setSchoolyear(s)}
                    renderOption={(op)=> op.text}
                    loading={syLoading}
                    placeholder="Rechercher une Année"
                    inputClassName="w-[220px]"
                    />:
                    <div className="flex items-center justify-between border h-[38px] w-[220px] rounded-md px-3 py-2 bg-white">
                        <span className="text-sm truncate">{schoolyear?.text || schoolyear?.code}</span>
                        <button
                        type="button"
                        onClick={() => setSchoolyear(null)}
                        className="text-xs text-red-500 hover:underline ml-2"
                        >
                        Changer
                        </button>
                    </div>
                    }
                </div>
            </div>
            <div className="w-full flex justify-center mt-3 mb-3">
            <Button
            variant="secondary"
            onClick={()=>{DownloadGradeGrid(formation,semester,schoolyear)}}
            disabled={!formation || !schoolyear || !semester}
            >
                Télécharger la grille de Note
            </Button>
            </div>
        </Card>
    )
}

export default HistoryGradeGridPanel