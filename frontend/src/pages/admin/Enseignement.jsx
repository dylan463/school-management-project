import { useState, useEffect, useCallback } from 'react'
import Card from '../../components/ui/Card'
import { UeModals } from './enseignements/UE'
import { CourModals } from './enseignements/Cours'
import { ExamenModals } from './enseignements/Examens'
import { NoteModals } from './enseignements/Notes'
import Filter from '../../components/Filter'
import RenderTable, { CreateAction } from '../../components/renderTable'
import ResetButton from '../../components/ResetButton'
import { BadgeUE, BadgeCour, BadgeExamen, BadgeNote ,BadgeResultat} from '../../pages/BadgeService'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import structuresService from '../../services/structuresService'
import assessmentsService from '../../services/assessmentsService'
import { toast } from 'react-toastify'
import SearchSelect from '../../components/SearchSelect'

// Composant pour les breadcrumbs
function Breadcrumbs({ selectedUE, selectedCours, selectedExamen, onClearAll }) {
  const parts = []
  if (selectedUE) parts.push({ label: selectedUE.code, type: 'UE' })
  if (selectedCours) parts.push({ label: selectedCours.code, type: 'Cours' })
  if (selectedExamen) parts.push({ label: selectedExamen.name, type: 'Examen' })

  const hasSelections = parts.length > 0

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-blue-700">Contexte:</span>
        {parts.map((part, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            <span className="text-xs font-medium text-blue-800">{part.label}</span>
            <span className="text-xs text-blue-600">({part.type})</span>
          </div>
        ))}
      </div>

      <button
        onClick={onClearAll}
        disabled={!hasSelections}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed rounded transition-colors"
        title="Effacer toutes les sélections"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Tout effacer
      </button>

    </div>
  )
}

const BadgeUeContent = [
  BadgeUE.code,
  BadgeUE.formation,
  BadgeUE.semester,
  BadgeUE.status,
]
const BadgeCourContent = [
  BadgeCour.code,
  BadgeCour.credits,
  BadgeCour.teacher,
  BadgeCour.hours,
  BadgeCour.status
]
const BadgeExamenContent = [
  BadgeExamen.type,
  BadgeExamen.date,
  BadgeExamen.session,
  BadgeExamen.weight,
  BadgeExamen.published,
]
const BadgeNoteContent = [
  BadgeNote.username,
  BadgeNote.grade,
  BadgeNote.debt,
]

export default function Enseignement() {
  const { role } = useAuth()
  // bread Crumbs
  const [selectedUe, setSelectedUe] = useState(null)
  const [selectedCour, setSelectedCour] = useState(null)
  const [selectedExamen, setSelectedExamen] = useState(null)

  const handleSelectUE = (ue) => {
    setSelectedUe(ue)
    setSelectedCour(null)
    setSelectedExamen(null)
  }
  const handleSelectCour = (cours) => {
    setSelectedCour(cours)
    setSelectedExamen(null)
  }

  const handleSelectExamen = (examen) => {
    setSelectedExamen(examen)
  }

  const handleClearAll = () => {
    setSelectedUe(null)
    setSelectedCour(null)
    setSelectedExamen(null)
  }

  // Ue params
  const [ues, setUes] = useState([])
  const [ueSearch, setUeSearch] = useState('')
  const [ueDebouncedSearch, setUeDebouncedSearch] = useState("")
  const [ueFormation, setUetFormation] = useState("")
  const [ueSemester, setUeSemester] = useState("")
  const [formations, setFormations] = useState([])
  const [ueSemesters, setUeSemesters] = useState([])
  const [ueStatus, setUetStatus] = useState("true")
  const [ueActionItem, setUeAtionItem] = useState(null)

  // Ue ModalStates
  const [ueAddModal, setUeAddModal] = useState(false)
  const [ueEditModal, setUeEditModal] = useState(false)
  const [ueDeleteModal, setUeDeleteModal] = useState(false)

  // Cours params
  const [cours, setCours] = useState([])
  const [courSearch, setCourSearch] = useState('')
  const [courDebouncedSearch, setCourDebouncedSearch] = useState("")
  const [courFormation, setCourFormation] = useState("")
  const [courUe, setCourUe] = useState("selected")
  const [courSemester, setCourSemester] = useState("")
  const [courSemesters, seCourtSemesters] = useState([])
  const [courStatus, setCourStatus] = useState("true")
  const [courActionItem, setCourAtionItem] = useState(null)

  // Cours ModalStates
  const [coursAddModal, setCoursAddModal] = useState(false)
  const [coursEditModal, setCoursEditModal] = useState(false)
  const [coursDeleteModal, setCoursDeleteModal] = useState(false)
  const [coursTeacherModal, setCoursTeacherModal] = useState(false)

  // Examen params
  const [examens, setExamens] = useState([])
  const [examenSearch, setExamenSearch] = useState('')
  const [examenDebouncedSearch, setExamenDebouncedSearch] = useState('')
  const [examenSchoolYear, setExamenSchoolYear] = useState(null)
  const [examenSySearchLoading, setExamenSySearchLoading] = useState(false)
  const [ActiveSy, setActiveSy] = useState(null)
  const [examenSySearch, setExamenSySearch] = useState('')
  const [examenSyDebouncedSearch, setExamenSyDebouncedSearch] = useState('')
  const [examenSyResults, setExamenSyResults] = useState([])
  const [examenActionItem, setExamenActionItem] = useState(null)
  // Examen ModalStates
  const [examenAddModal, setExamenAddModal] = useState(false)
  const [examenEditModal, setExamenEditModal] = useState(false)
  const [examenDeleteModal, setExamenDeleteModal] = useState(false)

  // Notes params
  const [notes, setNotes] = useState([])
  const [noteSearch, setNoteSearch] = useState('')
  const [noteDebouncedSearch, setNoteDebouncedSearch] = useState('')
  const [noteHasGrade, setNoteHasGrade] = useState('')
  const [noteHasDebt, setNoteHasDebt] = useState('')
  const [noteActionItem, setNoteActionItem] = useState(null)
  // Notes ModalStates
  const [noteGradeModal, setNoteGradeModal] = useState(false)

  const [resultats,setResultats] = useState([])
  const [resultatSchoolYear,setResultatSchoolYear] = useState(null)
  const [resultatSearch,setResultatSearch] = useState('')
  const [resultatDebouncedSearch,setResultatDebouncedSearch] = useState('')
  const [resultatSySearch, setResultatSySearch] = useState('')
  const [resultatSyDebouncedSearch, setResultatSyDebouncedSearch] = useState('')
  const [resultatSyResults, setResultatSyResults] = useState([])
  const [resultatSearchLoading,setResultatSearchLoading] = useState(false)
  // loaders
  const loadUEs = useCallback(async () => {
    const filters = {}
    if (ueDebouncedSearch) filters.search = ueDebouncedSearch
    if (ueFormation) filters.formation = ueFormation
    if (ueSemester) filters.semester = ueSemester
    if (ueStatus == "true") filters.is_active = true
    if (ueStatus == "false") filters.is_active = false
    try {
      const response = await structuresService.courseUnitService.getCourseUnits(filters)
      setUes(response)
    } catch { setUes([]) }
  }, [ueDebouncedSearch, ueFormation, ueSemester, ueStatus]
  )
  const loadFormations = useCallback(async () => {
    try {
      const response = await structuresService.FormationService.getFormations()
      setFormations(response)
    } catch {
      toast.error("Erreur lors du chargement des formations")
      setFormations([])
    }
  }, []
  )
  const loadUeSemesters = useCallback(async () => {
    try {
      const response = await structuresService.SemesterService.getSemesters({ formation: ueFormation })
      setUeSemesters(response)
    } catch {
      setUeSemesters([])
    }
  }, [ueFormation])

  const loadCours = useCallback(async () => {
    if (courUe === "selected" && !selectedUe){
      setCours([])
      return
    }
    const filters = {}
    if (courDebouncedSearch) filters.search = courDebouncedSearch
    if (selectedUe && courUe === "selected") filters.course_unit = selectedUe.id
    if (courFormation) filters.formation = courFormation
    if (courSemester) filters.semester = courSemester
    if (courStatus === "true") filters.is_active = true
    if (courStatus === "false") filters.is_active = false

    try {
      const response = await structuresService.courseModuleService.getCourseModules(filters)
      setCours(response)
    } catch { setCours([]) }
  }, [courDebouncedSearch, selectedUe, courUe, courFormation, courSemester, courStatus])

  const loadCourSemesters = useCallback(async () => {
    try {
      const response = await structuresService.SemesterService.getSemesters({ formation: courFormation })
      seCourtSemesters(response)
    } catch {
      seCourtSemesters([])
    }
  }, [courFormation])

  const loadResultats = useCallback(async ()=>{
    if (!selectedCour){
      setResultats([])
      return
    }
    const filters = {course_module:selectedCour.id}
    if (resultatSchoolYear) filters.school_year = resultatSchoolYear.id
    if (resultatDebouncedSearch) filters.search = resultatDebouncedSearch
    try{
      const response = await assessmentsService.resultService.getResults(filters)
      setResultats(response)
    }catch{
      setResultats([])
    }
  },[selectedCour,resultatSchoolYear,resultatDebouncedSearch])


  const loadExamenSchoolYears = useCallback(async () => {
    setExamenSySearchLoading(true)
    if (!examenSyDebouncedSearch) { setExamenSyResults([]); return }
    try {
      const res = await structuresService.schoolYearsService.searchSchoolYears({ search: examenSyDebouncedSearch })
      setExamenSyResults(res)
    } catch { setExamenSyResults([]) } finally { setExamenSySearchLoading(false) }
  }, [examenSyDebouncedSearch])

  const loadActiveSy = useCallback(async () => {
    if (!selectedCour) { setActiveSy(null); return }
    try {
      const r = await structuresService.schoolYearsService.getSchoolYears({status: "active" })
      setActiveSy(r[0] ? r[0] : null)
      if (r[0]) {setExamenSchoolYear(r[0]);setResultatSchoolYear(r[0])}
    } catch (error) {
      setActiveSy(null)
      toast.error(error.m)
    }
  }, [selectedCour])

  const loadExamens = useCallback(async () => {
    if (!selectedCour) {
      setExamens([])
      return
    }
    const filters = { course_module: selectedCour?.id }
    if (examenDebouncedSearch) filters.search = examenDebouncedSearch
    if (examenSchoolYear) filters.school_year = examenSchoolYear.id
    try {
      const res = await assessmentsService.assessmentService.getAssessments(filters)
      setExamens(Array.isArray(res) ? res : (res?.results ?? []))
    } catch { setExamens([]); console.log(error) }
  }, [examenDebouncedSearch, selectedCour, examenSchoolYear])

  const loadNotes = useCallback(async () => {
    if (!selectedExamen) { setNotes([]); return }
    const filters = {}
    if (noteDebouncedSearch) filters.search = noteDebouncedSearch
    if (noteHasGrade === 'true') filters.has_grade = true
    if (noteHasGrade === 'false') filters.has_grade = false
    if (noteHasDebt === 'true') filters.has_debt = true
    if (noteHasDebt === 'false') filters.has_debt = false
    try {
      const res = await assessmentsService.assessmentService.getAsessementAttendant(selectedExamen.id, filters)
      setNotes(res)
    } catch { setNotes([]) }
  }, [selectedExamen, noteDebouncedSearch, noteHasGrade, noteHasDebt])
  
  const loadResultatSchoolYears = useCallback(async () => {
    setResultatSearchLoading(true)
    if (!resultatSyDebouncedSearch) { setResultatSyResults([]); return }
    try {
      const res = await structuresService.schoolYearsService.searchSchoolYears({ search: resultatSyDebouncedSearch })
      setResultatSyResults(res)
    } catch { setResultatSyResults([]) } finally { setResultatSearchLoading(false) }
  }, [resultatSyDebouncedSearch])

  // debouced
  useEffect(() => {
    const timer = setTimeout(() => {
      setUeDebouncedSearch(ueSearch)
    }, 400)
    return () => clearTimeout(timer)
  }, [ueSearch])
  useEffect(() => {
    const timer = setTimeout(() => { setCourDebouncedSearch(courSearch) }, 400)
    return () => clearTimeout(timer)
  }, [courSearch])
  useEffect(() => {
    const timer = setTimeout(() => { setExamenDebouncedSearch(examenSearch) }, 400)
    return () => clearTimeout(timer)
  }, [examenSearch])
  useEffect(() => {
    const timer = setTimeout(() => { setExamenSyDebouncedSearch(examenSySearch) }, 300)
    return () => clearTimeout(timer)
  }, [examenSySearch])
  useEffect(() => {
    const timer = setTimeout(() => { setNoteDebouncedSearch(noteSearch) }, 400)
    return () => clearTimeout(timer)
  }, [noteSearch])
  useEffect(() => {
    const timer = setTimeout(() => { setResultatDebouncedSearch(resultatSearch) }, 400)
    return () => clearTimeout(timer)
  }, [resultatSearch])
  useEffect(() => {
    const timer = setTimeout(() => { setResultatSyDebouncedSearch(resultatSySearch) }, 300)
    return () => clearTimeout(timer)
  }, [resultatSySearch])
  

  // effects
  useEffect(() => { loadUEs() }, [loadUEs])
  useEffect(() => { loadFormations() }, [loadFormations])
  useEffect(() => { loadUeSemesters() }, [loadUeSemesters])
  useEffect(() => { loadCours() }, [loadCours])
  useEffect(() => { loadCourSemesters() }, [loadCourSemesters])
  useEffect(() => { loadExamenSchoolYears() }, [loadExamenSchoolYears])
  useEffect(() => { loadActiveSy() }, [loadActiveSy])
  useEffect(() => { loadExamens() }, [loadExamens])
  useEffect(() => { loadNotes() }, [loadNotes])
  useEffect(() => { loadResultats() }, [loadResultats])
  useEffect(() => { loadResultatSchoolYears() }, [loadResultatSchoolYears])

  // Ue Actions
  const handleAddUe = async (formData) => {
    try {
      await structuresService.courseUnitService.createCourseUnit(formData)
      loadUEs()
      toast.success('crée')
    } catch (error) {
      toast.error("Erreur lors de l'ajout de l\'unité d\'enseignement")
    }
  }
  const handleEditUe = async (formData) => {
    try {
      await structuresService.courseUnitService.updateCourseUnit(ueActionItem.id, formData)
      loadUEs()
      handleSelectUE(null)
      toast.success('modifiée')
    } catch (error) {
      console.log(error)
      toast.error('Erreur lors de la modification de l\'unité d\'enseignement')
    }
  }
  const handleDeleteUe = async () => {
    try {
      await structuresService.courseUnitService.deleteCourseUnit(ueActionItem.id)
      loadUEs()
      handleSelectUE(null)
      toast.success('supprimée')
    } catch (error) {
      toast.error(error.response.data.error)
    }
  }
  const handleToggleUEActivation = async (ue) => {
    try {
      await structuresService.courseUnitService.toggleCourseUnitActive(ue.id)
      loadUEs()
      handleSelectUE(null)
      toast.success("ok")
    } catch (error) {
      toast.error("erreur lors de la modification du cours")
    }
  }
  // cour Actions
  const handleAddCours = async (formData) => {
    try {
      await structuresService.courseModuleService.createCourseModule(formData)
      loadCours()
      loadUEs()
      handleSelectCour(null)
      toast.success('crée')
    } catch (error) {
      console.error(error)
    }
  }
  const handleEditCours = async (formData) => {
    try {
      await structuresService.courseModuleService.updateCourseModule(courActionItem.id, formData)
      loadCours()
      loadUEs()
      handleSelectCour(null)
      toast.success('modifiée')
    } catch (error) {
      toast.error('Erreur lors de la modification du cours')
    }
  }
  const handleDeleteCours = async () => {
    try {
      await structuresService.courseModuleService.deleteCourseModule(courActionItem.id)
      loadCours()
      loadUEs()
      handleSelectCour(null)
      toast.success('supprimée')
    } catch (error) {
      toast.error(error.response.data.error)
    }
  }
  const handleToggleCoursActivation = async (cours) => {
    try {
      await structuresService.courseModuleService.toggleActiveCourseModule(cours.id)
      loadCours()
      loadUEs()
      handleSelectCour(null)
      toast.success("ok")
    } catch (error) {
      console.log(error.response.data.error)
    }
  }
  const handleUpdateTeacherCourses = async (cours, teacher) => {
    try {
      await structuresService.courseModuleService.updateCourseModule(cours.id, { teacher: teacher? teacher.id : null })
      loadCours()
      handleSelectCour(null)
      toast.success("ok")
    } catch (error) {
      console.log(error)
    }
  }


  // Ue action list
  const UeActions = [
    CreateAction("Modifier", "blue", (ue) => { setUeAtionItem(ue), setUeEditModal(true) }, (ue) => { return !!ue.is_active }, role == "SUPERUSER"),
    CreateAction("Supprimer", "red", (ue) => { setUeAtionItem(ue), setUeDeleteModal(true) }, (ue) => { return !!ue.is_active }, role == "SUPERUSER"),
    CreateAction("Activer", "blue", (ue) => { handleToggleUEActivation(ue) }, (ue) => { return !ue.is_active }, role == "SUPERUSER"),
    CreateAction("Desactiver", "red", (ue) => { handleToggleUEActivation(ue) }, (ue) => { return !!ue.is_active }, role == "SUPERUSER"),
  ]
  const CourActions = [
    CreateAction("Modifier", "blue", (cours) => { setCourAtionItem(cours), setCoursEditModal(true) }, (cour) => { return !!cour.is_active }, role == "SUPERUSER"),
    CreateAction("Supprimer", "red", (cours) => { setCourAtionItem(cours), setCoursDeleteModal(true) }, (cours) => { return !!cours.is_active }, role == "SUPERUSER"),
    CreateAction("Activer", "blue", (cours) => { handleToggleCoursActivation(cours) }, (cours) => { return !cours.is_active }, role == "SUPERUSER"),
    CreateAction("Desactiver", "red", (cours) => { handleToggleCoursActivation(cours) }, (cours) => { return !!cours.is_active }, role == "SUPERUSER"),
    CreateAction("Enseignant", "red", (cours) => { setCourAtionItem(cours), setCoursTeacherModal(true) }, (cours) => { return !!cours.is_active }, role == "SUPERUSER"),
  ]

  // examen handlers
  const handleAddExamen = async (formData) => {
    try {
      await assessmentsService.assessmentService.createAssessment(formData)
      loadExamens()
      toast.success('créé')
    } catch (error) { console.log(error.response.data.error) }
  }
  const handleEditExamen = async (formData) => {
    try {
      await assessmentsService.assessmentService.updateAssessment(examenActionItem.id, formData)
      loadExamens()
      handleSelectExamen(null)
      toast.success('modifié')
    } catch { toast.error("Erreur lors de la modification de l'examen") }
  }
  const handleDeleteExamen = async () => {
    try {
      await assessmentsService.assessmentService.deleteAssessment(examenActionItem.id)
      loadExamens()
      handleSelectExamen(null)
      toast.success('supprimé')
    } catch (error) { toast.error(error?.response?.data?.error || "Erreur suppression") }
  }
  const handleTogglePublish = async (examen) => {
    try {
      if (examen.is_published) {
        await assessmentsService.assessmentService.unpublishAssessment(examen.id)
      } else {
        await assessmentsService.assessmentService.publishAssessment(examen.id)
      }
      loadExamens()
      toast.success(examen.is_published ? 'dépublié' : 'publié')
    } catch (error){ console.error(error.response.data.error) }
  }

  // notes handlers
  const handleGradeSubmit = async (formData) => {
    try {
      if (noteActionItem?.grade) {
        await assessmentsService.gradeService.updateGrade(noteActionItem.grade.id, formData.score)
      } else {
        await assessmentsService.gradeService.createGrade(formData)
      }
      loadNotes()
      toast.success('note enregistrée')
    } catch { toast.error("Erreur lors de l'enregistrement de la note") }
  }
  const handleDeleteNote = async (note) => {
    try {
      if (note?.grade) {
        await assessmentsService.gradeService.deleteGrade(note.grade.id)
        loadNotes()
        toast.success('note supprimée')
      }
    } catch (error) { console.log(error) }
  }

  const handleUpdateResultats = async () => {
    if (!selectedCour) return
    try{
      const response = await assessmentsService.resultService.publish({course_module:selectedCour.id})
      toast.success("resultat publier!")
      loadResultats()
    }catch (error){
      toast.error(error.response.data.error)
    }
  }

  // Examen action list
  const ExamenActions = [
    CreateAction("Modifier", "blue", (e) => { setExamenActionItem(e); setExamenEditModal(true) }, () => true, role == "SUPERUSER"),
    CreateAction("Publier", "green", (e) => { handleTogglePublish(e) }, (e) => !e.is_published, role == "SUPERUSER"),
    CreateAction("Dépublier", "red", (e) => { handleTogglePublish(e) }, (e) => !!e.is_published, role == "SUPERUSER"),
    CreateAction("Supprimer", "red", (e) => { setExamenActionItem(e); setExamenDeleteModal(true) }, () => true, role == "SUPERUSER"),
  ]
  // Note action list
  const NoteActions = [
    CreateAction("Note", "blue", (n) => { setNoteActionItem(n); setNoteGradeModal(true) }, () => true, role == "SUPERUSER"),
    CreateAction("Sup. note", "red", (n) => { handleDeleteNote(n) }, (n) => !!n.grade, role == "SUPERUSER"),
  ]

  return (
    <div className="fade-in space-y-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Enseignement</h2>
        <p className="text-sm text-slate-500 mt-1">Gestion hiérarchique des UE, Cours, Examens et Notes</p>
      </div>

      {/* Breadcrumbs de contexte */}
      <Breadcrumbs
        selectedUE={selectedUe}
        selectedCours={selectedCour}
        selectedExamen={selectedExamen}
        onClearAll={handleClearAll}
      />

      {/* Card 1: Unités d'Enseignement et Cours */}
      <div className='grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-5'>
        <Card >
          <div className="flex-1 min-w-0 border-r border-slate-200 last:border-r-0">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between flex-col items-start gap-y-2">
                <div className='flex justify-between  w-full items-center'>
                  <h3 className="font-semibold text-sm text-slate-700">Unités d'Enseignement</h3>
                  <Button
                    onClick={() => setUeAddModal(true)}
                    size="sm"
                    variant="outline"
                    className="text-xs px-2 py-1 h-7"
                  >
                    + Ajouter
                  </Button>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher une UE..."
                  value={ueSearch}
                  onChange={(e) => setUeSearch(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
                />
                <div className='flex flex-wrap gap-2'>
                  <Filter
                    value={ueFormation}
                    label='formation'
                    onChange={(e) => setUetFormation(e.target.value)}
                    options={formations}
                    optionAttr='code'
                    otherOptions={[{ value: "", label: "Tous" }]}
                  />
                  <Filter
                    value={ueSemester}
                    label='semestre'
                    onChange={(e) => setUeSemester(e.target.value)}
                    options={ueSemesters}
                    optionAttr='code'
                    otherOptions={[{ value: "", label: "Tous" }]}
                  />
                  <Filter
                    value={ueStatus}
                    label='status'
                    onChange={(e) => setUetStatus(e.target.value)}
                    otherOptions={[{ value: "", label: "Tous" }, { value: "true", label: "Actif" }, { value: "false", label: "Inactif" }]}
                  />
                  <ResetButton
                    disabled={!ueFormation && !ueSemester && !ueStatus && !ueSearch}
                    onReset={() => { setUetFormation(''); setUeSemester(''); setUetStatus(''); setUeSearch('') }}
                  />
                </div>
              </div>
            </div>
            <RenderTable
              contents={ues}
              titleBadge='label'
              badgeContent={BadgeUeContent}
              clickoutside='UEPannel'
              actions={UeActions}
              hasSelection="True"
              selectedItem={selectedUe}
              onSelectedItem={handleSelectUE}
            />
          </div>
        </Card>

        {/* cours pannel */}
        <Card >
          <div className="flex-1 min-w-0 border-r border-slate-200 last:border-r-0">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between flex-col items-start gap-y-2">
                <div className='flex justify-between  w-full items-center'>
                  <h3 className="font-semibold text-sm text-slate-700">Cours</h3>
                  <Button
                    onClick={() => setCoursAddModal(true)}
                    size="sm"
                    variant="outline"
                    className="text-xs px-2 py-1 h-7"
                    disabled={!selectedUe || role != "SUPERUSER"}
                  >
                    + Ajouter
                  </Button>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher une UE..."
                  value={courSearch}
                  onChange={(e) => setCourSearch(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
                />
                <div className='flex flex-wrap gap-2'>
                  <Filter
                    value={courUe}
                    label='UE'
                    onChange={(e) => setCourUe(e.target.value)}
                    otherOptions={[
                      { value: "", label: "Tous" },
                      { value: 'selected', label: 'séléctionée' }
                    ]}
                  />
                  <Filter
                    value={courFormation}
                    label='formation'
                    onChange={(e) => setCourFormation(e.target.value)}
                    options={formations}
                    optionAttr='code'
                    otherOptions={[{ value: "", label: "Tous" }]}
                  />
                  <Filter
                    value={courSemester}
                    label='semestre'
                    onChange={(e) => setCourSemester(e.target.value)}
                    options={courSemesters}
                    optionAttr='code'
                    otherOptions={[{ value: "", label: "Tous" }]}
                  />
                  <Filter
                    value={courStatus}
                    label='status'
                    onChange={(e) => setCourStatus(e.target.value)}
                    otherOptions={[{ value: "", label: "Tous" }, { value: "true", label: "Actif" }, { value: "false", label: "Inactif" }]}
                  />
                  <ResetButton
                    disabled={!courFormation && !courSemester && !courStatus && !courSearch && courUe !== "selected"}
                    onReset={() => { setCourFormation(''); setCourSemester(''); setCourStatus(''); setCourSearch(''), setCourUe('selected') }}
                  />
                </div>
              </div>
            </div>
            <RenderTable
              contents={cours}
              titleBadge='label'
              badgeContent={BadgeCourContent}
              clickoutside='CourPannel'
              actions={CourActions}
              hasSelection="True"
              selectedItem={selectedCour}
              onSelectedItem={handleSelectCour}
            />
          </div>
        </Card>

        {/* examen panel */}
        <Card >
          <div className="flex-1 min-w-0">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between flex-col items-start gap-y-2">
                <div className='flex justify-between w-full items-center'>
                  <h3 className="font-semibold text-sm text-slate-700">Examens</h3>
                  <Button onClick={() => setExamenAddModal(true)} size="sm" variant="outline" className="text-xs px-2 py-1 h-7" disabled={!selectedCour || !ActiveSy}>
                    + Ajouter
                  </Button>
                </div>
                <input type="text" placeholder="Rechercher un examen..." value={examenSearch}
                  onChange={(e) => setExamenSearch(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white" />
                <div className='flex flex-wrap gap-2 w-full'>
                  {/* school year search */}
                  <SearchSelect
                    clickOutside='examen-sysearch'
                    contents={examenSyResults}
                    search={examenSySearch}
                    setSearch={setExamenSySearch}
                    searchLoading={examenSySearchLoading}
                    debouncedSearch={examenSyDebouncedSearch}
                    selectedContent={examenSchoolYear}
                    onSelectContent={(content) => setExamenSchoolYear(content)}
                    BadgeContent={[
                      (year) => { return { content: year.label } }, (year) => { return { content: year.status == "ACTIVE" ? "active" : year.status == "UPCOMING" ? "à venir" : "passé", color: year.status == "ACTIVE" ? "green" : year.status == "UPCOMING" ? "yellow" : "red" } }
                    ]}
                    displayAttr=""
                    noDisplay={true}
                  />
                  {examenSchoolYear && (
                    <span className="px-2 py-1 text-xs bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                      {examenSchoolYear.label}
                      <button onClick={() => setExamenSchoolYear(null)} className="ml-1 text-blue-400 hover:text-blue-600">✕</button>
                    </span>
                  )}
                  <ResetButton disabled={!examenSearch && examenSchoolYear === ActiveSy}
                    onReset={() => { setExamenSearch(''); setExamenSchoolYear(ActiveSy) }} />
                </div>
              </div>
            </div>
            <RenderTable renderCondition={!!selectedCour} renderFailText='selectionner un cours pour voir les éxamens' noContentText='aucun examen'
              contents={examens} titleBadge='name' badgeContent={BadgeExamenContent}
              clickoutside='ExamenPannel' actions={ExamenActions}
              hasSelection="True" selectedItem={selectedExamen} onSelectedItem={handleSelectExamen} />
          </div>
        </Card>

        {/* notes panel */}
        <Card >
          <div className="flex-1 min-w-0">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between flex-col items-start gap-y-2">
                <h3 className="font-semibold text-sm text-slate-700">Participants et Notes</h3>
                <input type="text" placeholder="Rechercher un participant..." value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)} disabled={!selectedExamen}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white" />
                <div className='flex flex-wrap gap-2'>
                  <Filter value={noteHasGrade} label='note' onChange={(e) => setNoteHasGrade(e.target.value)}
                    otherOptions={[{ value: "", label: "Tous" }, { value: "true", label: "Avec note" }, { value: "false", label: "Sans note" }]} />
                  <Filter value={noteHasDebt} label='dette' onChange={(e) => setNoteHasDebt(e.target.value)}
                    otherOptions={[{ value: "", label: "Tous" }, { value: "true", label: "Avec dette" }, { value: "false", label: "Sans dette" }]} />
                  <ResetButton disabled={!noteSearch && !noteHasGrade && !noteHasDebt}
                    onReset={() => { setNoteSearch(''); setNoteHasGrade(''); setNoteHasDebt('') }} />
                </div>
              </div>
            </div>
            <RenderTable contents={notes} titleBadge='full_name' badgeContent={BadgeNoteContent}
              clickoutside='NotePannel' actions={NoteActions} hasSelection="False" selectedItem={null} onSelectedItem={() => { }} />
          </div>
        </Card>
      </div>

      {/* results panel */}
        <Card className=''>
          <div className="flex-1 min-w-0">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between flex-col items-start gap-y-2">
                <div className='flex justify-between w-full items-center'>
                  <h3 className="font-semibold text-sm text-slate-700">Resultats</h3>
                  <Button onClick={handleUpdateResultats} size="sm" variant="outline" className="text-xs px-2 py-1 h-7" disabled={!selectedCour || !ActiveSy}>
                    Publier les résultats
                  </Button>
                </div>
                <div className='flex flex-wrap gap-2 w-full'>
                  {/* school year search */}
                  <SearchSelect
                    clickOutside='resultat-sysearch'
                    contents={resultatSyResults}
                    search={resultatSySearch}
                    setSearch={setResultatSySearch}
                    searchLoading={resultatSearchLoading}
                    debouncedSearch={resultatSyDebouncedSearch}
                    selectedContent={resultatSchoolYear}
                    onSelectContent={(content) => setResultatSchoolYear(content)}
                    BadgeContent={[
                      (year) => { return { content: year.label } }, (year) => { return { content: year.status == "ACTIVE" ? "active" : year.status == "UPCOMING" ? "à venir" : "passé", color: year.status == "ACTIVE" ? "green" : year.status == "UPCOMING" ? "yellow" : "red" } }
                    ]}
                    displayAttr=""
                    noDisplay={true}
                  />
                  {resultatSchoolYear && (
                    <span className="px-2 py-1 text-xs bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                      {resultatSchoolYear.label}
                      <button onClick={() => setResultatSchoolYear(null)} className="ml-1 text-blue-400 hover:text-blue-600">✕</button>
                    </span>
                  )}
                  <ResetButton disabled={!resultatSearch && resultatSchoolYear === ActiveSy}
                    onReset={() => { setResultatSearch(''); setResultatSchoolYear(ActiveSy) }} />
                </div>
              </div>
            </div>
            <RenderTable renderCondition={!!selectedCour} renderFailText='selectionner un cours pour voir les résultat' noContentText='aucun resultat'
              contents={resultats} titleBadge='full_name' badgeContent={[
                BadgeResultat.formation,
                BadgeResultat.semester,
                BadgeResultat.final_score,
                BadgeResultat.course_credit,
                BadgeResultat.status,
              ]}
              clickoutside='ResultatPannel'/>
          </div>
        </Card>

      <UeModals
        ActionItem={ueActionItem}
        addModal={ueAddModal}
        editModal={ueEditModal}
        deleteModal={ueDeleteModal}
        addOnClose={() => { setUeAddModal(false); setUeAtionItem(null) }}
        editOnclose={() => { setUeEditModal(false); setUeAtionItem(null) }}
        deleteOnClose={() => { setUeDeleteModal(false); setUeAtionItem(null) }}
        addOnSubmit={handleAddUe}
        editOnSubmit={handleEditUe}
        deleteOnConfirm={handleDeleteUe}
      />
      <CourModals
        selectedUe={selectedUe}
        ActionItem={courActionItem}
        addModal={coursAddModal}
        editModal={coursEditModal}
        deleteModal={coursDeleteModal}
        teacherModal={coursTeacherModal}
        addOnClose={() => { setCoursAddModal(false); setCourAtionItem(null) }}
        editOnClose={() => { setCoursEditModal(false); setCourAtionItem(null) }}
        teacherOnClose={() => { setCoursTeacherModal(false); setCourAtionItem(null) }}
        deleteOnClose={() => { setCoursDeleteModal(false); setCourAtionItem(null) }}
        addOnSubmit={handleAddCours}
        editOnSubmit={handleEditCours}
        teacherOnSubmit={handleUpdateTeacherCourses}
        deleteOnConfirm={handleDeleteCours}
      />
      <ExamenModals
        selectedCour={selectedCour}
        ActionItem={examenActionItem}
        addModal={examenAddModal}
        editModal={examenEditModal}
        deleteModal={examenDeleteModal}
        addOnClose={() => { setExamenAddModal(false); setExamenActionItem(null) }}
        editOnClose={() => { setExamenEditModal(false); setExamenActionItem(null) }}
        deleteOnClose={() => { setExamenDeleteModal(false); setExamenActionItem(null) }}
        addOnSubmit={handleAddExamen}
        editOnSubmit={handleEditExamen}
        deleteOnConfirm={handleDeleteExamen}
        activeSchoolYear ={ActiveSy}
      />
      <NoteModals
        selectedExamen={selectedExamen}
        ActionItem={noteActionItem}
        gradeModal={noteGradeModal}
        gradeOnClose={() => { setNoteGradeModal(false); setNoteActionItem(null) }}
        gradeOnSubmit={handleGradeSubmit}
      />
    </div>
  )
}
