import { useState,useEffect } from "react"
import RenderTable from "../../../components/renderTable"
import Card from '../../../components/ui/Card'
import Filter from "../../../components/Filter"
import SearchSelect from "../../../components/SearchSelect"
import structuresService from "../../../services/structuresService"
import ResetButton from "../../../components/ResetButton"
import {BadgeInscription,BadgeYear} from "../../BadgeService"
import { toast } from "react-toastify"


export default function Registre(){
  const [inscriptions,setInscriptions] = useState([])
  const badgeContent = [
          BadgeInscription.username,
          BadgeInscription.level,
          BadgeInscription.formation,
          BadgeInscription.schoolYear,
          BadgeInscription.status
        ]

  const [search,setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [formationFilter,setFormationFilter] = useState('')
  const [levelFilter,setLevelFilter] = useState('')
  const [selectedYear,setSelectedYear] = useState(null)
  const [yearSearch,setYearSearch] = useState("")
  const [yearDebouncedSearch,setYearDebouncedSearch] = useState("")
  const [yearSearchLoading,setYearSearchLoading] = useState(false)


  const [statusFilter,setStatusFilter] = useState('')

  const [formations,setForamtions] = useState([])
  const [levels,setLevels] = useState([])
  const [years,setYears] = useState([])
  const yearListLimit = 5

  const loadInscriptions = async () => {
    const filters = {}
    if (debouncedSearch) filters.search = debouncedSearch
    if (formationFilter) filters.formation = formationFilter
    if (levelFilter) filters.level = levelFilter
    if (selectedYear) filters.school_year = selectedYear.id
    if (statusFilter) filters.status = statusFilter
    const response = await structuresService.studentSchoolYearsService.getStudentSchoolYears(filters)
    setInscriptions(response)
  }
  const loadFormations = async () => {
    try{
      const response = await structuresService.FormationService.getFormations()
      setForamtions(response)
    }catch (error){
      console.log('erreur lors du chargement des formation :',error)
      setForamtions([])
    }
  }
  const loadLevel = async () => {
    try{
      const filters = {}
      if (formationFilter) filters.formation = formationFilter
      const response = await structuresService.levelService.getLevels(filters)
      setLevels(response)
    }catch (error){
      console.error("erreur du chargement des niveaux :",error)
      setLevels([])
    }
  }
  const loadYears = async () => {
    setYearSearchLoading(true)
    try{
      const filters ={limit:yearListLimit}
      if (yearDebouncedSearch) {
        filters.search = yearDebouncedSearch
        const response = await structuresService.schoolYearsService.getSchoolYears(filters)
        setYears(response)
      }else{
        setYears([])
      }
    }catch (error){
      console.error("erreur du chargement des année scolaire :",error)
      setYears([])
    }finally {
      setYearSearchLoading(false)
    }
  }
  // chargement des inscriptions
  useEffect(()=>{loadInscriptions()},[formationFilter,levelFilter,selectedYear,statusFilter,debouncedSearch])
  // chargement des formations
  useEffect(()=>{loadFormations()},[])
  // chargement des levels
  useEffect(()=>{loadLevel()},[formationFilter])
  // chargement des years
  useEffect(()=>{
    loadYears()
  },[yearDebouncedSearch])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      setYearDebouncedSearch(yearSearch)
    }, 400)
    return () => clearTimeout(timer)
  }, [yearSearch])

  // actions
  const handleDelete = async (id) => {
    try{
      await structuresService.studentSchoolYearsService.deleteStudentSchoolYear(id)
    }catch(error){
      msg = "erreur pendant la suppression de l'inscription"
      console.log(msg," : ",error)
      toast.error(msg)
    }
  }


  const actions = [
    {title:"Supprimer",color:"red",onClick:handleDelete}
  ]

  return(
    <div className="fade-in space-y-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Registres</h2>
        <p className="text-sm text-slate-500 mt-1">Gérer les inscription annuelles et les historiques des étudiants</p>
      </div>
      <Card>
        <div className="flex-1 min-w-0">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-sm text-slate-700"></h3>
            </div>
            {/* recherche */}
            <input
              type="text"
              name="inscriptionSearch"
              placeholder="Rechercher un participant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
            />
            {/* filtrage */}
            <div className="flex items-center gap-2 mt-2">
              <Filter
                defaultValue={formationFilter}
                onChange={setFormationFilter}
                label="formation"
                otherOptions={[{value:'',label:'Tous'}]}
                options={formations}
                optionAttr='code'
              />
              <Filter
                defaultValue={levelFilter}
                onChange={setLevelFilter}
                label="niveau"
                otherOptions={[{value:'',label:'Tous'}]}
                options={levels}
                optionAttr='code'
              />
              <Filter
                defaultValue={statusFilter}
                onChange={setStatusFilter}
                label="status"
                otherOptions={[
                  {value:'',label:'Tous'},
                  {value:'ACTIVE',label:'Actif'},
                  {value:'PROMOTED',label:'Promus'},
                  {value:'REPEAT',label:'Redouble'},
                  {value:'EXCLUDED',label:'Excus'},
                ]}
              />
              <ResetButton
                disabled={!search && !yearSearch && formationFilter==="" && levelFilter ==="" && selectedYear===null && statusFilter===""}
                onReset={()=>{
                  setSearch('')
                  setYearSearch('')
                  setFormationFilter('')
                  setLevelFilter('')
                  setStatusFilter('')
                  setSelectedYear(null)
                }}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <SearchSelect
                clickOutside="inscription-search"
                label="année scolaire"
                contents={years}
                search={yearSearch}
                setSearch={setYearSearch}
                debouncedSearch={yearDebouncedSearch}
                searchLoading={yearSearchLoading}
                selectedContent={selectedYear}
                onSelectContent={setSelectedYear}
                BadgeContent={[BadgeYear.label,BadgeYear.status]}
                displayAttr='label'
                displayPlaceholder='non selectionnée'
              />
            </div>
          </div>
          <RenderTable 
          noContentText="Aucune inscription trouvée"
          contents={inscriptions}
          titleBadge="full_name"
          badgeContent={badgeContent}
          clickoutside="inscriptions"
          actions={actions}
          />
        </div>
      </Card>
    </div>
  )
}
