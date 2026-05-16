import { useState,useEffect} from "react"
import RenderTable from "../../../components/renderTable"
import Card from '../../../components/ui/Card'
import Filter from "../../../components/Filter"
import SearchSelect from "../../../components/SearchSelect"
import structuresService from "../../../services/structuresService"
import etudiantService from "../../../services/studentService"
import ResetButton from "../../../components/ResetButton"
import {BadgeInscription,BadgeYear,BadgeUser} from "../../BadgeService"
import { toast } from "react-toastify"
import Button from "../../../components/ui/Button"
import Modal from "../../../components/Modal"
import CofirmModal from "../../../components/ConfirmModal"
import extractDRFError from "../../../utils/extractError"
import {useAuth} from "../../../context/AuthContext"

function RegistreForReinscription({
  inscriptionFilter,
  statusOptions = [],
  title="",
  yearSearchFilter= {limit:5},
  defaultStatus = "",
  actionItem = null,
  actions = [],
  setActionItem = (item) => {},
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
  const [selectedYear,setSelectedYear] = useState(null)
  const [yearSearch,setYearSearch] = useState("")
  const [yearDebouncedSearch,setYearDebouncedSearch] = useState("")
  const [yearSearchLoading,setYearSearchLoading] = useState(false)

  const [statusFilter,setStatusFilter] = useState(defaultStatus)

  const [formations,setForamtions] = useState([])
  const [levels,setLevels] = useState([])
  const [years,setYears] = useState([])

  const loadInscriptions = async () => {
    const filters = {...inscriptionFilter}
    if (!selectedYear) {
      setInscriptions([])
      return
    }
    if (debouncedSearch) filters.search = debouncedSearch
    if (formationFilter) filters.formation = formationFilter
    if (levelFilter) filters.level = levelFilter
    if (selectedYear) filters.school_year = selectedYear.id
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
  const loadYears = async () => {
    setYearSearchLoading(true)
    try{
      const filters ={...yearSearchFilter}
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
    }finally{
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
            onChange={(e) => setFormationFilter(e.target.value)}
            label="formation"
            otherOptions={[{value:'',label:'Tous'}]}
            options={formations}
            optionAttr='code'
          />
          <Filter
            defaultValue={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            label="niveau"
            otherOptions={[{value:'',label:'Tous'}]}
            options={levels}
            optionAttr='code'
          />
          {manyStatus && <Filter
            defaultValue={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="status"
            otherOptions={statusOptions}
          />}
          <ResetButton
            disabled={!search && formationFilter==="" && levelFilter ==="" && statusFilter===defaultStatus && selectedYear=== null}
            onReset={()=>{
              setSearch('')
              setFormationFilter('')
              setLevelFilter('')
              setStatusFilter(defaultStatus)
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
            searchLoading={yearSearchLoading}
            debouncedSearch={yearDebouncedSearch}
            selectedContent={selectedYear}
            onSelectContent={setSelectedYear}
            BadgeContent={[BadgeYear.label,BadgeYear.status]}
            displayAttr='label'
            displayPlaceholder='non selectionnée'
            />
        </div>
      </div>
      <RenderTable
      renderCondition={!!selectedYear}
      renderFailText="vaillez selectionnée une année scolaire"
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

function InscrireForm({onSubmit,onClose,selectedStudent}){
  const [loading,setLoading] = useState(false)
  const [formations,setFormations] = useState([])
  const [levels,setLevels] = useState([])
  const [formation,setFormation] = useState('')
  const [level,setLevel] = useState('')
  const [years,setYears] = useState([])
  const [selectedYear,setSelectedYear]= useState(null)
  const [yearSearch,setYearSearch] = useState('')
  const [yearDebouncedSearch,setYearDebouncedSearch] = useState('')
  const [searchLoading,setSearchLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setYearDebouncedSearch(yearSearch)
    }, 400)
    return () => clearTimeout(timer)
  }, [yearSearch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formation || !level || !selectedYear){
      toast.error('veillez remplir les champs obligatoires')
      return
    }
    setLoading(true)
    try {
      const data = {student_id:selectedStudent.id,formation_id:formation,level_id:level,school_year_id:selectedYear.id}
      await onSubmit(data)
      onClose()
    }catch (error){
      toast.error(extractDRFError(error))
    }finally{
      setLoading(false)
    }

  }
  const loadFormations =  async() => {
    try{
      const r = await structuresService.FormationService.getFormations()
      setFormations(r)
    }catch(error){
      setFormations([])
      const msg = "erreur pendant le chargement des formations"
      toast.error(msg)
    }
  }
  const loadLevels =  async() => {
    try{
      const filters = {}
      if (formation) filters.formation = formation
      const r = await structuresService.levelService.getLevels(filters)
      setLevels(r)
    }catch(error){
      setLevels([])
      const msg = "erreur pendant le chargement des niveaux"
      toast.error(msg)
    }
  }
  const loadYears =  async() => {
    setSearchLoading(true)
    try{
      const r = await structuresService.schoolYearsService.getSchoolYears({status:"open"})
      setYears(r)
    }catch(error){
      setYears([])
      const msg = "erreur pendant le chargement de l'année scolaire"
      toast.error(msg)
    }finally{
      setSearchLoading(false)
    }
  }


  useEffect(() => {
    loadFormations()
  },[])
  useEffect(() => {
    setLevel('')
    loadLevels()
  },[formation])
  useEffect(() => {
    loadYears()
  },[yearDebouncedSearch])



return(
<form onSubmit={handleSubmit} className="space-y-4">
  <h2 className="text-lg font-semibold">inscire un etudiant</h2>
  <p>Nom et prénoms: {selectedStudent?.full_name}</p>
  <p>Matricule: {selectedStudent.username}</p>

  <div className="grid grid-row-2 gap-4">
    <Filter
    value={formation}
    label="formation"
    onChange={(e) => {setFormation(e.target.value)
    }}
    options={formations}
    optionAttr="code"
    otherOptions={[
      {value:"",label:"Non séléctionée"}
    ]}
    />
    <Filter
    value={level}
    label="level"
    onChange={(e) => {setLevel(e.target.value)
    }}
    options={levels}
    optionAttr="code"
    otherOptions={[
      {value:"",label:"Non séléctionée"}
    ]}
    />
  </div>
  <SearchSelect
  clickOutside="yearSearch-in-form"
  label="Année scolaire *"
  contents={years}
  search={yearSearch}
  setSearch={setYearSearch}
  searchLoading ={searchLoading}
  debouncedSearch={yearDebouncedSearch}
  selectedContent={selectedYear}
  onSelectContent={setSelectedYear}
  BadgeContent={[
    BadgeYear.label,
    BadgeYear.status
  ]}
  displayAttr="label"
  displayPlaceholder="non séléctionné"
  />
  <div className="flex gap-3 pt-4">
    <button
      type="button"
      onClick={onClose}
      className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
    >
      Annuler
    </button>
    <button
      type="submit"
      disabled={loading}
      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'création...': 'créer'}
    </button>
  </div>
</form>
)
}


function UserOnlyInscription({title ="inscription étudiant",eventListener = () => {}, selectedStudent = null,setSelectedStudent = (student) => {},actions=[]}){
  const [inscriptions,setInscriptions] = useState([])
  const [InscrirModal,setInscrirModal] = useState(false)


  const badgeContent = [
          BadgeInscription.username,
          BadgeInscription.level,
          BadgeInscription.formation,
          BadgeInscription.status
          ]

  const [students,setStudents] = useState([])
  const [studentSearch,setStudentSearch] = useState('')
  const [studentDebouncedSearch,setStudentDebouncedSearch] = useState('')
  const [searchLoading,setSearchLoading] = useState(false)   
  const studentSearchLimit = 5

  const loadStudents = async () => {
    setSearchLoading(true)
    try{
      const filters = {limit:studentSearchLimit}
      if (studentDebouncedSearch) filters.search = studentDebouncedSearch
      const r = await etudiantService.search(filters)
      setStudents(r)
    }catch(error){
      setStudents([])
      const msg = "erreur chargement des etudants"
      toast.error(msg)
    }finally{
      setSearchLoading(false)
    }
  }
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setStudentDebouncedSearch(studentSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [studentSearch])
  
  useEffect(() => {
    loadStudents()
  }, [studentDebouncedSearch])
  
  const loadInscriptions = async () => {
    if (selectedStudent){
      const response = await structuresService.studentSchoolYearsService.getStudentSchoolYears({student:selectedStudent.id})
      setInscriptions(response)
    }else{
      setInscriptions([])
    }
  }

  useEffect(() => {
    eventListener(loadInscriptions)
  }, [loadInscriptions])

  const handleInscrire = async (data) =>{
    await structuresService.studentSchoolYearsService.createStudentSchoolYear(data)
    loadInscriptions()
  }

  useEffect(() => {
    loadInscriptions()
  }, [selectedStudent])

    return (
<Card className='min-w-[600px]'>
    <div className="flex-1 min-w-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="gap-y-2">
            <div className="flex justify-between space-between mb-2">
            {title && <h2 className="font-semibold text-sm text-slate-700">{title}</h2>}
            <Button
                onClick={() => {
                  setInscrirModal(true)
                }}
                size="sm"
                variant="outline"
                className="text-xs px-2 py-1 h-7"
                disabled={!selectedStudent || !!selectedStudent?.active_ssy}
            >
                inscrire
            </Button>
            </div>
            <div className="gap-y-2">
              <h4>Rechercher un etudiant</h4>
              <SearchSelect
              clickOutside="studentSearch-in-form"
              contents={students}
              search={studentSearch}
              setSearch={setStudentSearch}
              searchLoading ={searchLoading}
              debouncedSearch={studentDebouncedSearch}
              selectedContent={selectedStudent}
              onSelectContent={setSelectedStudent}
              BadgeContent={[
                BadgeUser.fullname,
                BadgeUser.email,
                BadgeUser.username
              ]}
              noDisplay={true}
              />
              {selectedStudent && <div className="flex gap-x-3 mt-2">
                <div>
                  <div className="flex flew-wrap gap-x-3">
                  <h4>étudiant</h4>
                  <Button
                    onClick={(e) => {
                      setSelectedStudent(null)
                    }}
                    size="sm"
                    variant="outline"
                    className="text-xs px-2 py-1 h-7"
                  >
                    ✕
                  </Button>
                  </div>
                  <table className="border-collapse">
                    <tbody>
                      <tr>
                        <td className="pr-4 font-semibold">Nom et prénom</td>
                        <td className="px-2">:</td>
                        <td>{selectedStudent.full_name}</td>
                      </tr>

                      <tr>
                        <td className="pr-4 font-semibold">Matricule</td>
                        <td className="px-2">:</td>
                        <td>{selectedStudent.username}</td>
                      </tr>

                      <tr>
                        <td className="pr-4 font-semibold">Email</td>
                        <td className="px-2">:</td>
                        <td>{selectedStudent.email}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>}
            </div>
            </div>
        </div>
        <RenderTable
        renderCondition={!!selectedStudent}
        renderFailText="veuillez selectionner un étudiant"
        noContentText="Aucune inscription trouvée"
        contents={inscriptions}
        titleBadge="full_name"
        badgeContent={badgeContent}
        clickoutside="inscriptions"
        actions={actions}      
        />
    </div>
    {InscrirModal && (
    <Modal
    isOpen={InscrirModal}
    onClose={() => {
      setInscrirModal(false)
    }}
    >
      <InscrireForm
      onClose={() => setInscrirModal(false)}
      onSubmit={handleInscrire}
      selectedStudent={selectedStudent}
      />
    </Modal>
  )}
</Card>
    )
}
const inscriptionConditions = {
  isActive: (ins) => {
    return ins?.status === 'ACTIVE'
  }
}

export default function Reinscription(){
  const {role} = useAuth()
  const [selectedStudent,setSelectedStudent] = useState(null)
  const [DeleteModal,setDeleteModal] = useState(false)

  const [actionItem1,setActionItem1] = useState(null)
  const [actionItem2,setActionItem2] = useState(null)
  const [actionItem3,setActionItem3] = useState(null)

  const openDeleteModal = (content) => {
    setActionItem3(content)
    setDeleteModal(true)
  }
  const handleDelete = async () => {
    await structuresService.studentSchoolYearsService.deleteStudentSchoolYear(actionItem3.id)
    const event = new CustomEvent('InscriptionChange', {
      detail: { 
        action: 'deleted', 
        inscriptionId: actionItem3?.id 
      }
    })
    document.dispatchEvent(event)
    setDeleteModal(false)
    setActionItem3(null)
  }

  const addEventListener = (reloadingFunciton = () => {}) => {
    const handleInscriptionChange = (event) => {
      reloadingFunciton()
    }
    document.addEventListener('InscriptionChange', handleInscriptionChange)
    return () => {
      document.removeEventListener('InscriptionChange', handleInscriptionChange)
    }
  }

  const userOnlyViewActions = [
    {title:'Supprimer',color:'red',onClick:openDeleteModal,contentCondition:inscriptionConditions.isActive,condition:role === 'SUPERUSER'}
  ]

    return (
<div className="fade-in space-y-5">
  <div className="mb-4">
    <h2 className="text-2xl font-bold text-slate-800">Déliberation</h2>
    <p className="text-sm text-slate-500 mt-1">Prendre une décision pendant une année scolaire active</p>
  </div>
  <div className='flex gap-4 flex-wrap'>
  <RegistreForReinscription 
  title='inscriptions terminée'
  yearSearchFilter={{status:"closed",limit:3}}
  inscriptionFilter={{completed:true}}
  statusOptions={[
    {value:'PROMOTED',label:'Promus'},
    {value:'EXCLUDED',label:'Exclus'},
    {value:'REPEAT',label:'Redouble'}, 
  ]}
  />
  <RegistreForReinscription
  title='nouvelles inscriptions'
  yearSearchFilter={{status:"open",limit:3}}
  inscriptionFilter={{completed:false}}
  manyStatus={false}
  defaultStatus='ACTIVE'
  />
  <UserOnlyInscription
  selectedStudent={selectedStudent}
  setSelectedStudent={(student) => {setSelectedStudent(student)}}
  actions={userOnlyViewActions}
  eventListener={addEventListener}
  />
  </div>
  {DeleteModal &&(
    <CofirmModal
    title="Supprimer l'inscription"
    message="Êtes-vous sûr de vouloir supprimer cette inscription ?"
    isOpen={DeleteModal}
    onClose={() =>{
      setActionItem3(null)
      setDeleteModal(false)
    }}
    onConfirm={() =>{
      handleDelete()
    }}
    confirmText="Supprimer"
    cancelText="Annuler"
    type="danger"
    />
  )}
</div>
    )
}