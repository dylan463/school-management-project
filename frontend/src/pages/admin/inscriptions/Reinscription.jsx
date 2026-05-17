import { useState, useEffect, useCallback, useMemo } from "react"
import RenderTable from "../../../components/renderTable"
import Card from '../../../components/ui/Card'
import Filter from "../../../components/Filter"
import SearchSelect from "../../../components/SearchSelect"
import structuresService from "../../../services/structuresService"
import etudiantService from "../../../services/studentService"
import ResetButton from "../../../components/ResetButton"
import { BadgeInscription, BadgeYear, BadgeUser } from "../../BadgeService"
import { toast } from "react-toastify"
import Button from "../../../components/ui/Button"
import Modal from "../../../components/Modal"
import CofirmModal from "../../../components/ConfirmModal"
import extractDRFError from "../../../utils/extractError"
import { useAuth } from "../../../context/AuthContext"

// ─── Helper : formulaire d'inscription (rendu dans une Modal) ────────────────
function InscrireForm({ onSubmit, onClose, selectedStudent }) {
  const [loading, setLoading] = useState(false)
  const [formations, setFormations] = useState([])
  const [levels, setLevels] = useState([])
  const [formation, setFormation] = useState('')
  const [level, setLevel] = useState('')
  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState(null)
  const [yearSearch, setYearSearch] = useState('')
  const [yearDebouncedSearch, setYearDebouncedSearch] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setYearDebouncedSearch(yearSearch), 400)
    return () => clearTimeout(t)
  }, [yearSearch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formation || !level || !selectedYear) {
      toast.error('Veuillez remplir les champs obligatoires')
      return
    }
    setLoading(true)
    try {
      const data = { student_id: selectedStudent.id, formation_id: formation, level_id: level, school_year_id: selectedYear.id }
      await onSubmit(data)
      onClose()
    } catch (error) {
      toast.error(extractDRFError(error))
    } finally {
      setLoading(false)
    }
  }

  const loadFormations = async () => {
    try {
      const r = await structuresService.FormationService.getFormations()
      setFormations(r)
    } catch { setFormations([]) }
  }
  const loadLevels = async () => {
    try {
      const filters = {}
      if (formation) filters.formation = formation
      const r = await structuresService.levelService.getLevels(filters)
      setLevels(r)
    } catch { setLevels([]) }
  }
  const loadYears = async () => {
    setSearchLoading(true)
    try {
      const r = await structuresService.schoolYearsService.getSchoolYears({ status: "open" })
      setYears(r)
    } catch { setYears([]) } finally { setSearchLoading(false) }
  }

  useEffect(() => { loadFormations() }, [])
  useEffect(() => { setLevel(''); loadLevels() }, [formation])
  useEffect(() => { loadYears() }, [yearDebouncedSearch])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Inscrire un étudiant</h2>
      <p>Nom et prénoms : {selectedStudent?.full_name}</p>
      <p>Matricule : {selectedStudent?.username}</p>
      <div className="grid grid-row-2 gap-4">
        <Filter value={formation} label="formation" onChange={(e) => setFormation(e.target.value)}
          options={formations} optionAttr="code" otherOptions={[{ value: "", label: "Non séléctionée" }]} />
        <Filter value={level} label="level" onChange={(e) => setLevel(e.target.value)}
          options={levels} optionAttr="code" otherOptions={[{ value: "", label: "Non séléctionée" }]} />
      </div>
      <SearchSelect
        clickOutside="yearSearch-in-form" label="Année scolaire *"
        contents={years} search={yearSearch} setSearch={setYearSearch}
        searchLoading={searchLoading} debouncedSearch={yearDebouncedSearch}
        selectedContent={selectedYear} onSelectContent={setSelectedYear}
        BadgeContent={[BadgeYear.label, BadgeYear.status]}
        displayAttr="label" displayPlaceholder="non séléctionné"
      />
      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onClose}
          className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
          Annuler
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Création...' : 'Créer'}
        </button>
      </div>
    </form>
  )
}

// ─── Constantes ──────────────────────────────────────────────────────────────
const inscriptionConditions = {
  isActive: (ins) => ins?.status === 'ACTIVE'
}

const BADGE_CONTENT = [
  BadgeInscription.username,
  BadgeInscription.level,
  BadgeInscription.formation,
  BadgeInscription.status,
  BadgeInscription.finalYear,
]

// ─── Composant principal ─────────────────────────────────────────────────────
export default function Reinscription() {
  const { role } = useAuth()

  // ── Options / filtres statiques ────────────────────────────────────────────
  const pastStatusOptions = useMemo(() => [
    { value: '', label: 'Tous' },
    { value: 'PROMOTED', label: 'Promus' },
    { value: 'EXCLUDED', label: 'Exclus' },
    { value: 'REPEAT', label: 'Redouble' },
  ], [])

  // ── Formations partagées ───────────────────────────────────────────────────
  const [formations, setFormations] = useState([])

  // ── État : Registre "inscriptions terminées" (année passée) ───────────────
  const [pastYear, setPastYear] = useState(null)
  const [selectedInscription, setSelectedInscription] = useState(null)
  const [pastInscriptions, setPastInscriptions] = useState([])
  const [pastSearch, setPastSearch] = useState("")
  const [pastDebouncedSearch, setPastDebouncedSearch] = useState("")
  const [pastFormationFilter, setPastFormationFilter] = useState("")
  const [pastLevelFilter, setPastLevelFilter] = useState("")
  const [pastLevels, setPastLevels] = useState([])
  const [pastStatusFilter, setPastStatusFilter] = useState("")
  const [pastYearSearch, setPastYearSearch] = useState("")
  const [pastYearDebouncedSearch, setPastYearDebouncedSearch] = useState("")
  const [pastYearSearchLoading, setPastYearSearchLoading] = useState(false)
  const [pastYears, setPastYears] = useState([])

  // ── État : Registre "nouvelles inscriptions" (année courante) ─────────────
  const [currentYear, setCurrentYear] = useState(null)
  const [currentInscriptions, setCurrentInscriptions] = useState([])
  const [currentSearch, setCurrentSearch] = useState("")
  const [currentDebouncedSearch, setCurrentDebouncedSearch] = useState("")
  const [currentFormationFilter, setCurrentFormationFilter] = useState("")
  const [currentLevelFilter, setCurrentLevelFilter] = useState("")
  const [currentLevels, setCurrentLevels] = useState([])
  const [currentYearSearch, setCurrentYearSearch] = useState("")
  const [currentYearDebouncedSearch, setCurrentYearDebouncedSearch] = useState("")
  const [currentYearSearchLoading, setCurrentYearSearchLoading] = useState(false)
  const [currentYears, setCurrentYears] = useState([])

  // ── État : Inscription par étudiant ───────────────────────────────────────
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [userInscriptions, setUserInscriptions] = useState([])
  const [inscrireModal, setInscrireModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [actionItem, setActionItem] = useState(null)
  const [students, setStudents] = useState([])
  const [studentSearch, setStudentSearch] = useState("")
  const [studentDebouncedSearch, setStudentDebouncedSearch] = useState("")
  const [studentSearchLoading, setStudentSearchLoading] = useState(false)

  // ── Chargement : formations partagées ─────────────────────────────────────
  const loadFormations = useCallback(async () => {
    try {
      const r = await structuresService.FormationService.getFormations()
      setFormations(r)
    } catch (e) {
      console.error('Erreur chargement formations :', e)
      setFormations([])
    }
  }, [])

  // ── Chargement : registre passé ────────────────────────────────────────────
  const loadPastInscriptions = useCallback(async () => {
    if (!pastYear) { setPastInscriptions([]); return }
    try {
      const filters = { completed: true }
      if (currentYear?.id) filters.not_in_year = currentYear.id
      if (pastDebouncedSearch) filters.search = pastDebouncedSearch
      if (pastFormationFilter) filters.formation = pastFormationFilter
      if (pastLevelFilter) filters.level = pastLevelFilter
      filters.school_year = pastYear.id
      if (pastStatusFilter) filters.status = pastStatusFilter
      const r = await structuresService.studentSchoolYearsService.getStudentSchoolYears(filters)
      console.log('filters', filters)
      console.log('r', r)
      setPastInscriptions(r)
    } catch (e) {
      console.error('Erreur chargement inscriptions passées :', e)
      setPastInscriptions([])
    }
  }, [pastYear, currentYear, pastDebouncedSearch, pastFormationFilter, pastLevelFilter, pastStatusFilter])

  const loadPastLevels = useCallback(async () => {
    try {
      const filters = {}
      if (pastFormationFilter) filters.formation = pastFormationFilter
      const r = await structuresService.levelService.getLevels(filters)
      setPastLevels(r)
    } catch { setPastLevels([]) }
  }, [pastFormationFilter])

  const loadPastYears = useCallback(async () => {
    setPastYearSearchLoading(true)
    try {
      if (pastYearDebouncedSearch) {
        const r = await structuresService.schoolYearsService.getSchoolYears({ status: "closed", limit: 3, search: pastYearDebouncedSearch })
        setPastYears(r)
      } else {
        setPastYears([])
      }
    } catch { setPastYears([]) } finally { setPastYearSearchLoading(false) }
  }, [pastYearDebouncedSearch])

  // ── Chargement : registre courant ──────────────────────────────────────────
  const loadCurrentInscriptions = useCallback(async () => {
    if (!currentYear) { setCurrentInscriptions([]); return }
    try {
      const filters = { completed: false, status: 'ACTIVE', school_year: currentYear.id }
      if (currentDebouncedSearch) filters.search = currentDebouncedSearch
      if (currentFormationFilter) filters.formation = currentFormationFilter
      if (currentLevelFilter) filters.level = currentLevelFilter
      const r = await structuresService.studentSchoolYearsService.getStudentSchoolYears(filters)
      setCurrentInscriptions(r)
    } catch (e) {
      console.error('Erreur chargement inscriptions courantes :', e)
      setCurrentInscriptions([])
    }
  }, [currentYear, currentDebouncedSearch, currentFormationFilter, currentLevelFilter])

  const loadCurrentLevels = useCallback(async () => {
    try {
      const filters = {}
      if (currentFormationFilter) filters.formation = currentFormationFilter
      const r = await structuresService.levelService.getLevels(filters)
      setCurrentLevels(r)
    } catch { setCurrentLevels([]) }
  }, [currentFormationFilter])

  const loadCurrentYears = useCallback(async () => {
    setCurrentYearSearchLoading(true)
    try {
      if (currentYearDebouncedSearch) {
        const r = await structuresService.schoolYearsService.getSchoolYears({ status: "open", limit: 3, search: currentYearDebouncedSearch })
        setCurrentYears(r)
      } else {
        setCurrentYears([])
      }
    } catch { setCurrentYears([]) } finally { setCurrentYearSearchLoading(false) }
  }, [currentYearDebouncedSearch])

  // ── Chargement : étudiant & ses inscriptions ───────────────────────────────
  const loadUserInscriptions = useCallback(async () => {
    if (!selectedStudent) { setUserInscriptions([]); return }
    try {
      const r = await structuresService.studentSchoolYearsService.getStudentSchoolYears({ student: selectedStudent.id })
      setUserInscriptions(r)
    } catch { setUserInscriptions([]) }
  }, [selectedStudent])

  const reloadSelectedStudent = useCallback(async (id = null) => {
    if (!selectedStudent && !id) return
    try {
      const r = await etudiantService.getStudent(id || selectedStudent.id)
      setSelectedStudent(r)
    } catch { /* ignore */ }
  }, [selectedStudent])

  const loadStudents = useCallback(async () => {
    setStudentSearchLoading(true)
    try {
      const filters = { limit: 5 }
      if (studentDebouncedSearch) filters.search = studentDebouncedSearch
      const r = await etudiantService.search(filters)
      setStudents(r)
    } catch {
      setStudents([])
      toast.error("Erreur lors du chargement des étudiants")
    } finally { setStudentSearchLoading(false) }
  }, [studentDebouncedSearch])

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleReinscrire = async (inscription) => {
    try {
      await structuresService.studentSchoolYearsService.promoteStudentSchoolYear(inscription.student, currentYear.id)
      toast.success("Réinscription réussie")
      loadPastInscriptions()
      loadCurrentInscriptions()
    } catch (error) {
      toast.error(extractDRFError(error))
    }
  }

  const handleInscrire = async (data) => {
    await structuresService.studentSchoolYearsService.createStudentSchoolYear(data)
    await reloadSelectedStudent()
    loadUserInscriptions()
    loadPastInscriptions()
    loadCurrentInscriptions()
  }

  const handleDeleteInscription = async () => {
    try {
      await structuresService.studentSchoolYearsService.deleteStudentSchoolYear(actionItem.id)
      setDeleteModal(false)
      setActionItem(null)
      await reloadSelectedStudent()
      loadUserInscriptions()
      loadPastInscriptions()
      loadCurrentInscriptions()
    } catch (error) {
      toast.error(extractDRFError(error))
    }
  }
  const handleDeleteCurrentInscription = async (inscription) => {
    try {
      await structuresService.studentSchoolYearsService.deleteStudentSchoolYear(inscription.id)
      await reloadSelectedStudent()
      loadUserInscriptions()
      loadCurrentInscriptions()
      loadPastInscriptions()
    } catch (error) {
      toast.error(extractDRFError(error))
    }
  }

  // ── Debounce effects ───────────────────────────────────────────────────────
  useEffect(() => { const t = setTimeout(() => setPastDebouncedSearch(pastSearch), 400); return () => clearTimeout(t) }, [pastSearch])
  useEffect(() => { const t = setTimeout(() => setCurrentDebouncedSearch(currentSearch), 400); return () => clearTimeout(t) }, [currentSearch])
  useEffect(() => { const t = setTimeout(() => setPastYearDebouncedSearch(pastYearSearch), 400); return () => clearTimeout(t) }, [pastYearSearch])
  useEffect(() => { const t = setTimeout(() => setCurrentYearDebouncedSearch(currentYearSearch), 400); return () => clearTimeout(t) }, [currentYearSearch])
  useEffect(() => { const t = setTimeout(() => setStudentDebouncedSearch(studentSearch), 300); return () => clearTimeout(t) }, [studentSearch])

  // ── Data loading effects ───────────────────────────────────────────────────
  useEffect(() => { loadFormations() }, [loadFormations])

  useEffect(() => { loadPastInscriptions() }, [loadPastInscriptions])
  useEffect(() => { loadPastLevels() }, [loadPastLevels])
  useEffect(() => { setPastLevelFilter('') }, [pastFormationFilter])
  useEffect(() => { loadPastYears() }, [loadPastYears])

  useEffect(() => { loadCurrentInscriptions() }, [loadCurrentInscriptions])
  useEffect(() => { loadCurrentLevels() }, [loadCurrentLevels])
  useEffect(() => { setCurrentLevelFilter('') }, [currentFormationFilter])
  useEffect(() => { loadCurrentYears() }, [loadCurrentYears])

  useEffect(() => { loadUserInscriptions() }, [loadUserInscriptions])
  useEffect(() => { loadStudents() }, [loadStudents])

  // ── Définition des actions ─────────────────────────────────────────────────
  const pastActions = [
    {
      title: 'Reinscrire',
      color: 'blue',
      onClick: handleReinscrire,
      contentCondition: (ins) => ["PROMOTED", "REPEAT"].includes(ins.status) && ins.final_year === false,
      condition: role === 'SUPERUSER' && !!currentYear
    }
  ]

  const currentActions = role === 'SUPERUSER' ? [
    {
      title: 'Supprimer',
      color: 'red',
      onClick: handleDeleteCurrentInscription,
      contentCondition: (ins) => ["ACTIVE"].includes(ins.status),
    }
  ] : []

  const userActions = [
    {
      title: 'Supprimer',
      color: 'red',
      onClick: (inscription) => { setActionItem(inscription); setDeleteModal(true) },
      contentCondition: inscriptionConditions.isActive,
      condition: role === 'SUPERUSER',
    }
  ]

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in space-y-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Reinscriptions</h2>
        <p className="text-sm text-slate-500 mt-1">Effectuer les réinscriptions des étudiants</p>
      </div>

      <div className='flex gap-4 flex-wrap'>

        {/* ══════════════════════════════════════════════════════
            REGISTRE : inscriptions terminées (année passée)
        ══════════════════════════════════════════════════════ */}
        <Card className='min-w-[600px]'>
          <div className="flex-1 min-w-0">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-sm text-slate-700">Inscriptions terminées</h3>
              </div>
              <input
                type="text" name="pastSearch"
                placeholder="Rechercher un participant..."
                value={pastSearch} onChange={(e) => setPastSearch(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
              />
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Filter defaultValue={pastFormationFilter} onChange={(e) => setPastFormationFilter(e.target.value)}
                  label="formation" otherOptions={[{ value: '', label: 'Tous' }]} options={formations} optionAttr='code' />
                <Filter defaultValue={pastLevelFilter} onChange={(e) => setPastLevelFilter(e.target.value)}
                  label="niveau" otherOptions={[{ value: '', label: 'Tous' }]} options={pastLevels} optionAttr='code' />
                <Filter value={pastStatusFilter} onChange={(e) => setPastStatusFilter(e.target.value)}
                  label="status" otherOptions={pastStatusOptions} />
                <ResetButton
                  disabled={!pastSearch && pastFormationFilter === "" && pastLevelFilter === "" && pastStatusFilter === "" && pastYear === null && selectedInscription === null}
                  onReset={() => { setPastSearch(''); setPastFormationFilter(''); setPastLevelFilter(''); setPastStatusFilter(''); setPastYear(null); setSelectedInscription(null) }}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <SearchSelect
                  clickOutside="past-inscription-search" label="année scolaire"
                  contents={pastYears} search={pastYearSearch} setSearch={setPastYearSearch}
                  searchLoading={pastYearSearchLoading} debouncedSearch={pastYearDebouncedSearch}
                  selectedContent={pastYear} onSelectContent={setPastYear}
                  BadgeContent={[BadgeYear.label, BadgeYear.status]}
                  displayAttr='label' displayPlaceholder='non selectionnée'
                />
              </div>
            </div>
            <RenderTable
              renderCondition={!!pastYear} renderFailText="Veuillez sélectionner une année scolaire"
              noContentText="Aucune inscription trouvée" contents={pastInscriptions}
              titleBadge="full_name" badgeContent={BADGE_CONTENT}
              hasSelection={true}
              selectedItem={selectedInscription}
              onSelectedItem={(ins) => { setSelectedInscription(ins); reloadSelectedStudent(ins.student) }}
              clickoutside="past-inscriptions" actions={pastActions}
            />
          </div>
        </Card>

        {/* ══════════════════════════════════════════════════════
            REGISTRE : nouvelles inscriptions (année courante)
        ══════════════════════════════════════════════════════ */}
        <Card className='min-w-[600px]'>
          <div className="flex-1 min-w-0">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-sm text-slate-700">Nouvelles inscriptions</h3>
              </div>
              <input
                type="text" name="currentSearch"
                placeholder="Rechercher un participant..."
                value={currentSearch} onChange={(e) => setCurrentSearch(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
              />
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Filter defaultValue={currentFormationFilter} onChange={(e) => setCurrentFormationFilter(e.target.value)}
                  label="formation" otherOptions={[{ value: '', label: 'Tous' }]} options={formations} optionAttr='code' />
                <Filter defaultValue={currentLevelFilter} onChange={(e) => setCurrentLevelFilter(e.target.value)}
                  label="niveau" otherOptions={[{ value: '', label: 'Tous' }]} options={currentLevels} optionAttr='code' />
                <ResetButton
                  disabled={!currentSearch && currentFormationFilter === "" && currentLevelFilter === "" && currentYear === null}
                  onReset={() => { setCurrentSearch(''); setCurrentFormationFilter(''); setCurrentLevelFilter(''); setCurrentYear(null) }}
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <SearchSelect
                  clickOutside="current-inscription-search" label="année scolaire"
                  contents={currentYears} search={currentYearSearch} setSearch={setCurrentYearSearch}
                  searchLoading={currentYearSearchLoading} debouncedSearch={currentYearDebouncedSearch}
                  selectedContent={currentYear} onSelectContent={setCurrentYear}
                  BadgeContent={[BadgeYear.label, BadgeYear.status]}
                  displayAttr='label' displayPlaceholder='non selectionnée'
                />
              </div>
            </div>
            <RenderTable
              renderCondition={!!currentYear} renderFailText="Veuillez sélectionner une année scolaire"
              noContentText="Aucune inscription trouvée" contents={currentInscriptions}
              titleBadge="full_name" badgeContent={BADGE_CONTENT}
              clickoutside="current-inscriptions" actions={currentActions}
            />
          </div>
        </Card>

        {/* ══════════════════════════════════════════════════════
            INSCRIPTION PAR ÉTUDIANT
        ══════════════════════════════════════════════════════ */}
        <Card className='min-w-[600px]'>
          <div className="flex-1 min-w-0">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="gap-y-2">
                <div className="flex justify-between space-between mb-2">
                  <h2 className="font-semibold text-sm text-slate-700">Inscription étudiant</h2>
                  <Button
                    onClick={() => setInscrireModal(true)}
                    size="sm" variant="outline" className="text-xs px-2 py-1 h-7"
                    disabled={!selectedStudent || !!selectedStudent?.active_ssy}
                  >
                    Inscrire
                  </Button>
                </div>
                <div className="gap-y-2">
                  <h4>Rechercher un étudiant</h4>
                  <SearchSelect
                    clickOutside="studentSearch-in-form"
                    contents={students} search={studentSearch} setSearch={setStudentSearch}
                    searchLoading={studentSearchLoading} debouncedSearch={studentDebouncedSearch}
                    selectedContent={selectedStudent} onSelectContent={setSelectedStudent}
                    BadgeContent={[BadgeUser.fullname, BadgeUser.email, BadgeUser.username]}
                    noDisplay={true}
                  />
                  {selectedStudent && (
                    <div className="flex gap-x-3 mt-2">
                      <div>
                        <div className="flex flex-wrap gap-x-3">
                          <h4>Étudiant</h4>
                          <Button onClick={() => setSelectedStudent(null)} size="sm" variant="outline" className="text-xs px-2 py-1 h-7">✕</Button>
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
                    </div>
                  )}
                </div>
              </div>
            </div>
            <RenderTable
              renderCondition={!!selectedStudent} renderFailText="Veuillez sélectionner un étudiant"
              noContentText="Aucune inscription trouvée" contents={userInscriptions}
              titleBadge="full_name" badgeContent={BADGE_CONTENT}
              clickoutside="user-inscriptions" actions={userActions}
            />
          </div>

          {inscrireModal && (
            <Modal isOpen={inscrireModal} onClose={() => setInscrireModal(false)}>
              <InscrireForm
                onClose={() => setInscrireModal(false)}
                onSubmit={handleInscrire}
                selectedStudent={selectedStudent}
              />
            </Modal>
          )}

          {deleteModal && (
            <CofirmModal
              title="Supprimer l'inscription"
              message="Êtes-vous sûr de vouloir supprimer cette inscription ?"
              isOpen={deleteModal}
              onClose={() => { setActionItem(null); setDeleteModal(false) }}
              onConfirm={handleDeleteInscription}
              confirmText="Supprimer" cancelText="Annuler" type="danger"
            />
          )}
        </Card>

      </div>
    </div>
  )
}