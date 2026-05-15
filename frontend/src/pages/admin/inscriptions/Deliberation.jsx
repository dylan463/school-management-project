import {useEffect, useState} from 'react'
import {BadgeInscription} from "../../BadgeService"
import { toast } from 'react-toastify'
import structuresService from '../../../services/structuresService'
import Card from '../../../components/ui/Card'
import Filter from '../../../components/Filter'
import ResetButton from '../../../components/ResetButton'
import RenderTable from '../../../components/renderTable'


const inscr = {
  isActive:(content) => {
    return content.status == "ACTIVE"
  },
  canReturn: (content) => {
    return ["PROMOTED","REPEAT","EXCLUDED"].includes(content.status)
  }

}


function RegistreDélibérations({
  inscriptionFilter,
  statusOptions = [],
  selectedYear,
  noActiveMsg = '',
  title="",
  defaultStatus = "",
  actions=[],
  manyStatus = true
}){
  const [inscriptions,setInscriptions] = useState([])
  const badgeContent = [
          BadgeInscription.username,
          BadgeInscription.level,
          BadgeInscription.formation,
          BadgeInscription.status
        ]

  const [search,setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [formationFilter,setFormationFilter] = useState('')
  const [levelFilter,setLevelFilter] = useState('')

  const [statusFilter,setStatusFilter] = useState(defaultStatus)

  const [formations,setForamtions] = useState([])
  const [levels,setLevels] = useState([])

  const loadInscriptions = async () => {
    if (!selectedYear) {
        setInscriptions([])
        return
    }
    const filters = {...inscriptionFilter,school_year:selectedYear.id}
    if (debouncedSearch) filters.search = debouncedSearch
    if (formationFilter) filters.formation = formationFilter
    if (levelFilter) filters.level = levelFilter
    if (statusFilter !== defaultStatus) filters.status = statusFilter
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
  // chargement des inscriptions
  useEffect(()=>{loadInscriptions()},[formationFilter,levelFilter,selectedYear,statusFilter,debouncedSearch])
  // chargement des formations
  useEffect(()=>{loadFormations()},[])
  // chargement des levels
  useEffect(()=>{loadLevel()},[formationFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])


  return(
  <Card className='min-w-[600px]'>
    <div className="flex-1 min-w-0">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-start mb-2">
          {title && <h3 className="font-semibold text-sm text-slate-700">{title}</h3>}
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
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Filter
            defaultValue={formationFilter}
            onChange={setFormationFilter}
            label="formation :"
            otherOptions={[{value:'',label:'Tous'}]}
            options={formations}
            optionAttr='code'
          />
          <Filter
            defaultValue={levelFilter}
            onChange={setLevelFilter}
            label="level :"
            otherOptions={[{value:'',label:'Tous'}]}
            options={levels}
            optionAttr='code'
          />
          {manyStatus && <Filter
            defaultValue={statusFilter}
            onChange={setStatusFilter}
            label="status"
            otherOptions={statusOptions}
          />}
          <ResetButton
            disabled={!search && formationFilter==="" && levelFilter ==="" && statusFilter===defaultStatus}
            onReset={()=>{
              setSearch('')
              setFormationFilter('')
              setLevelFilter('')
              setStatusFilter(defaultStatus)
            }}
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className='w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-600'>
            {selectedYear? `année scolaire active : ${selectedYear.label} nombre d'inscription : ${inscriptions.length}`:'aucune année scolaire est active'}
          </div>
        </div>
      </div>
      <RenderTable
      renderCondition={!!selectedYear}
      renderFailText={noActiveMsg}
      noContentText="Aucune inscription trouvée"
      contents={inscriptions}
      titleBadge="full_name"
      badgeContent={badgeContent}
      clickoutside="inscriptions"
      actions={actions}
      />
    </div>
  </Card>
  )
}

export default function Deliberation(){
  const [activeYear,setActiveYear] = useState(null)
  const incompleteFilter = {completed:false}
  
  
  const completeFilter = {completed:true}
  const completeStatusOptions =[
    {value:'',label:'Tous'},
    {value:'PROMOTED',label:'Promus'},
    {value:'EXCLUDED',label:'Exclus'},
    {value:'REPEAT',label:'Redouble'},
  ]
  const noActiveMsg = "veillez attendre une année scolaire active avant de délibéré"
  
  const loadActiveYear = async () =>{
    try{
      const response = await structuresService.schoolYearsService.getSchoolYears({status:'active'})
      if (response[0]){
        setActiveYear(response[0])
      }else{
        setActiveYear(null)
      }
    }catch(error){
      setActiveYear(null)
      let msg = 'erreur lors du chagement de l année scolaire'
      console.log(`${msg} : `,error)
      toast.error(msg)
    }    
  }
  const handlePromote = async (id) => {
    await structuresService.studentSchoolYearsService.changeDecision(id,{decision:"PROMOTED"})
    loadActiveYear()
  }

  const handleExclud = async (id) => {
    await structuresService.studentSchoolYearsService.changeDecision(id,{decision:"EXCLUDED"})
    loadActiveYear()
  }

  const handleRepeat = async (id) => {
    await structuresService.studentSchoolYearsService.changeDecision(id,{decision:"REPEAT"})
    loadActiveYear()
  }

  const handleActivate = async (id) => {
    await structuresService.studentSchoolYearsService.changeDecision(id,{decision:"ACTIVE"})
    loadActiveYear()
  }

  useEffect(()=>{
    loadActiveYear()
  },[])

  const incompleteAcitons = [
    {title:"Promovoir",color:"green",onClick:handlePromote,contentCondition:inscr.isActive},
    {title:"Exclure",onClick:handleExclud,contentCondition:inscr.isActive},
    {title:"Redoubler",onClick:handleRepeat,contentCondition:inscr.isActive},
  ]
  const completeAcitons = [
    {title:"Annuler",onClick:handleActivate,contentCondition:inscr.canReturn}
  ]

  return (
<div className="fade-in space-y-5">
  <div className="mb-4">
    <h2 className="text-2xl font-bold text-slate-800">Déliberation</h2>
    <p className="text-sm text-slate-500 mt-1">Prendre une décision pendant une année scolaire active</p>
  </div>
  <div className='flex gap-4 flex-wrap'>
  <RegistreDélibérations 
  inscriptionFilter={incompleteFilter}
  noActiveMsg={noActiveMsg}
  selectedYear={activeYear}
  title='Etudiants non délibéré'
  defaultStatus='ACTIVE'
  actions={incompleteAcitons}
  manyStatus={false}
  />
  <RegistreDélibérations
  inscriptionFilter={completeFilter}
  statusOptions={completeStatusOptions}
  title='Etudiants délibéré'
  noActiveMsg={noActiveMsg}
  selectedYear={activeYear}
  actions={completeAcitons}
  />
  </div>
</div>
  )
}