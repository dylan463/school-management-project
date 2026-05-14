import {useEffect, useState,useId} from 'react'
import BadgeInscription from '../../BadgeService'


function RegistreFiltered({inscriptionFilter,statusIn = [],selectedYear}){
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

  const [statusFilter,setStatusFilter] = useState('')

  const [formations,setForamtions] = useState([])
  const [levels,setLevels] = useState([])

  const loadInscriptions = async () => {
    if (!selectedYear) {
        setInscriptions([])
        return
    }
    const filters = {...inscriptionFilter}
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

  const actions = [
  ]

  return(
    <div className="fade-in space-y-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Registres</h2>
        <p className="text-sm text-slate-500 mt-1">Gérer les inscription annuelles et les historique des étudiants</p>
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
              <Filter
                defaultValue={statusFilter}
                onChange={setStatusFilter}
                label="status"
                otherOptions={statusIn}
              />
              <ResetButton
                disabled={!search && formationFilter==="" && levelFilter ==="" && selectedYear===null && statusFilter===""}
                onReset={()=>{
                  setSearch('')
                  setFormationFilter('')
                  setLevelFilter('')
                  setStatusFilter('')
                }}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className='w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-600'>
                année scolaire active : {selectedYear.label} nombre d'inscription : {inscriptions.length}
              </div>
            </div>
          </div>
          <RenderTable
          renderCondition={!!selectedYear}
          renderFailText="Veuillez sélectionner une année scolaire"
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



export default function Deliberation(){
    return <div>
      <RegistreFiltered
      />
    </div>
}