import { useCallback, useEffect, useState } from 'react'
import { BadgeInscription } from "../../BadgeService"
import { toast } from 'react-toastify'
import structuresService from '../../../services/structuresService'
import assessmentsService from '../../../services/assessmentsService'
import Card from '../../../components/ui/Card'
import Filter from '../../../components/Filter'
import ResetButton from '../../../components/ResetButton'
import RenderTable from '../../../components/renderTable'
import Bulletin from "../../../components/Bulletin"

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inscr = {
  isActive: (c) => c.status === "ACTIVE",
  canReturn: (c) => ["PROMOTED", "REPEAT", "EXCLUDED"].includes(c.status),
}

const BADGE_CONTENT = [
  BadgeInscription.username,
  BadgeInscription.level,
  BadgeInscription.formation,
  BadgeInscription.status,
]

const NO_ACTIVE_MSG = "Veuillez attendre une année scolaire active avant de délibérer"

// ─── Composant principal ───────────────────────────────────────────────────────
export default function Deliberation() {

  // ── Année scolaire active ─────────────────────────────────────────────────
  const [activeYear, setActiveYear] = useState(null)

  // ── Panneau « Non délibérés » ─────────────────────────────────────────────
  const [incompleteInscriptions, setIncompleteInscriptions] = useState([])
  const [incompleteSearch, setIncompleteSearch] = useState("")
  const [incompleteDebouncedSearch, setIncompleteDebouncedSearch] = useState("")
  const [incompleteFormation, setIncompleteFormation] = useState("")
  const [incompleteLevel, setIncompleteLevel] = useState("")
  const [incompleteLevels, setIncompleteLevels] = useState([])

  // ── Panneau « Délibérés » ─────────────────────────────────────────────────
  const [completeInscriptions, setCompleteInscriptions] = useState([])
  const [completeSearch, setCompleteSearch] = useState("")
  const [completeDebouncedSearch, setCompleteDebouncedSearch] = useState("")
  const [completeFormation, setCompleteFormation] = useState("")
  const [completeLevel, setCompleteLevel] = useState("")
  const [completeStatus, setCompleteStatus] = useState("")
  const [completeLevels, setCompleteLevels] = useState([])

  //  ── Panneau « Bulletin » ────────────────────────────────────────────────-
  const [selectedInscription, setSelectedInscription] = useState(null)
  const [bulletins, setBulletins] = useState([])

  // ── Données partagées ─────────────────────────────────────────────────────
  const [formations, setFormations] = useState([])

  // ── Options status ────────────────────────────────────────────────────────
  const completeStatusOptions = [
    { value: '', label: 'Tous' },
    { value: 'PROMOTED', label: 'Promus' },
    { value: 'EXCLUDED', label: 'Exclus' },
    { value: 'REPEAT', label: 'Redouble' },
  ]

  // ─── Loaders ────────────────────────────────────────────────────────────────
  const loadActiveYear = useCallback(async () => {
    try {
      const response = await structuresService.schoolYearsService.getSchoolYears({ status: 'active' })
      setActiveYear(response[0] ?? null)
    } catch (error) {
      setActiveYear(null)
      toast.error("Erreur lors du chargement de l'année scolaire")
      console.error(error)
    }
  }, [])

  const loadFormations = useCallback(async () => {
    try {
      const response = await structuresService.FormationService.getFormations()
      setFormations(response)
    } catch (error) {
      console.error('Erreur chargement formations :', error)
      setFormations([])
    }
  }, [])

  const loadIncompleteLevels = useCallback(async () => {
    try {
      const filters = incompleteFormation ? { formation: incompleteFormation } : {}
      const response = await structuresService.levelService.getLevels(filters)
      setIncompleteLevels(response)
    } catch { setIncompleteLevels([]) }
  }, [incompleteFormation])

  const loadCompleteLevels = useCallback(async () => {
    try {
      const filters = completeFormation ? { formation: completeFormation } : {}
      const response = await structuresService.levelService.getLevels(filters)
      setCompleteLevels(response)
    } catch { setCompleteLevels([]) }
  }, [completeFormation])

  const loadIncompleteInscriptions = useCallback(async () => {
    if (!activeYear) { setIncompleteInscriptions([]); return }
    try {
      const filters = { completed: false, school_year: activeYear.id, status: 'ACTIVE' }
      if (incompleteDebouncedSearch) filters.search = incompleteDebouncedSearch
      if (incompleteFormation) filters.formation = incompleteFormation
      if (incompleteLevel) filters.level = incompleteLevel
      const response = await structuresService.studentSchoolYearsService.getStudentSchoolYears(filters)
      setIncompleteInscriptions(response)
    } catch { setIncompleteInscriptions([]) }
  }, [activeYear, incompleteDebouncedSearch, incompleteFormation, incompleteLevel])

  const loadCompleteInscriptions = useCallback(async () => {
    if (!activeYear) { setCompleteInscriptions([]); return }
    try {
      const filters = { completed: true, school_year: activeYear.id }
      if (completeDebouncedSearch) filters.search = completeDebouncedSearch
      if (completeFormation) filters.formation = completeFormation
      if (completeLevel) filters.level = completeLevel
      if (completeStatus) filters.status = completeStatus
      const response = await structuresService.studentSchoolYearsService.getStudentSchoolYears(filters)
      setCompleteInscriptions(response)
    } catch { setCompleteInscriptions([]) }
  }, [activeYear, completeDebouncedSearch, completeFormation, completeLevel, completeStatus])

  const loadBulletins = useCallback(async () => {
    if (!selectedInscription) { setBulletins([]); return }
    try {
      const filters = {
        student_school_year: selectedInscription.id
      }
      const response = await assessmentsService.bulletinService.getBulletins(filters)
      setBulletins(response)
    } catch (error) {
      setBulletins([])
      toast.error("Erreur lors du chargement des bulletins")
      console.error(error)
    }
  }, [selectedInscription])

  // ─── Actions délibération ────────────────────────────────────────────────────
  const changeDecision = async (ins, decision) => {
    try {
      await structuresService.studentSchoolYearsService.changeDecision(ins.id, { decision })
      loadIncompleteInscriptions()
      loadCompleteInscriptions()
    } catch (error) {
      toast.error("Erreur lors de la délibération")
      console.error(error)
    }
  }

  const handlePromote = (ins) => changeDecision(ins, "PROMOTED")
  const handleExclude = (ins) => changeDecision(ins, "EXCLUDED")
  const handleRepeat = (ins) => changeDecision(ins, "REPEAT")
  const handleActivate = (ins) => changeDecision(ins, "ACTIVE")

  // ─── Définition des actions ──────────────────────────────────────────────────
  const incompleteActions = [
    { title: "Promovoir", color: "green", onClick: handlePromote, contentCondition: inscr.isActive, condition: true },
    { title: "Exclure", color: "red", onClick: handleExclude, contentCondition: inscr.isActive, condition: true },
    { title: "Redoubler", color: "blue", onClick: handleRepeat, contentCondition: inscr.isActive, condition: true },
  ]
  const completeActions = [
    { title: "Annuler", color: "red", onClick: handleActivate, contentCondition: inscr.canReturn, condition: true },
  ]

  // ─── Effets ──────────────────────────────────────────────────────────────────
  useEffect(() => { loadActiveYear() }, [loadActiveYear])
  useEffect(() => { loadFormations() }, [loadFormations])

  useEffect(() => { loadIncompleteLevels(); setIncompleteLevel('') }, [incompleteFormation])
  useEffect(() => { loadCompleteLevels(); setCompleteLevel('') }, [completeFormation])

  useEffect(() => { loadIncompleteInscriptions() }, [loadIncompleteInscriptions])
  useEffect(() => { loadCompleteInscriptions() }, [loadCompleteInscriptions])
  useEffect(() => { loadBulletins() }, [loadBulletins])

  // debounce
  useEffect(() => {
    const t = setTimeout(() => setIncompleteDebouncedSearch(incompleteSearch), 400)
    return () => clearTimeout(t)
  }, [incompleteSearch])

  useEffect(() => {
    const t = setTimeout(() => setCompleteDebouncedSearch(completeSearch), 400)
    return () => clearTimeout(t)
  }, [completeSearch])

  // ─── Rendu ───────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in space-y-5">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Délibération</h2>
        <p className="text-sm text-slate-500 mt-1">Prendre une décision pendant une année scolaire active</p>
      </div>

      <div className="flex gap-4 flex-wrap">

        {/* ── Panneau : Non délibérés ── */}
        <Card className="min-w-[600px] flex-1">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-sm text-slate-700 mb-2">Étudiants non délibérés</h3>
            <input
              type="text"
              placeholder="Rechercher un participant..."
              value={incompleteSearch}
              onChange={(e) => setIncompleteSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
            />
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Filter
                value={incompleteFormation}
                onChange={(e) => setIncompleteFormation(e.target.value)}
                label="formation :"
                otherOptions={[{ value: '', label: 'Tous' }]}
                options={formations}
                optionAttr="code"
              />
              <Filter
                value={incompleteLevel}
                onChange={(e) => setIncompleteLevel(e.target.value)}
                label="level :"
                otherOptions={[{ value: '', label: 'Tous' }]}
                options={incompleteLevels}
                optionAttr="code"
              />
              <ResetButton
                disabled={!incompleteSearch && incompleteFormation === "" && incompleteLevel === ""}
                onReset={() => { setIncompleteSearch(''); setIncompleteFormation(''); setIncompleteLevel('') }}
              />
            </div>
            <div className="mt-2 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
              {activeYear
                ? `Année active : ${activeYear.label} — ${incompleteInscriptions.length} inscription(s)`
                : "Aucune année scolaire active"}
            </div>
          </div>
          <RenderTable
            renderCondition={!!activeYear}
            renderFailText={NO_ACTIVE_MSG}
            noContentText="Aucune inscription trouvée"
            contents={incompleteInscriptions}
            titleBadge="full_name"
            badgeContent={BADGE_CONTENT}
            clickoutside="incomplete-inscriptions"
            hasSelection={true}
            selectedItem={selectedInscription}
            onSelectedItem={setSelectedInscription}
            actions={incompleteActions}
          />
        </Card>

        {/* ── Panneau : Délibérés ── */}
        <Card className="min-w-[600px] flex-1">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-sm text-slate-700 mb-2">Étudiants délibérés</h3>
            <input
              type="text"
              placeholder="Rechercher un participant..."
              value={completeSearch}
              onChange={(e) => setCompleteSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
            />
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Filter
                value={completeFormation}
                onChange={(e) => setCompleteFormation(e.target.value)}
                label="formation :"
                otherOptions={[{ value: '', label: 'Tous' }]}
                options={formations}
                optionAttr="code"
              />
              <Filter
                value={completeLevel}
                onChange={(e) => setCompleteLevel(e.target.value)}
                label="level :"
                otherOptions={[{ value: '', label: 'Tous' }]}
                options={completeLevels}
                optionAttr="code"
              />
              <Filter
                value={completeStatus}
                onChange={(e) => setCompleteStatus(e.target.value)}
                label="status"
                otherOptions={completeStatusOptions}
              />
              <ResetButton
                disabled={!completeSearch && completeFormation === "" && completeLevel === "" && completeStatus === ""}
                onReset={() => { setCompleteSearch(''); setCompleteFormation(''); setCompleteLevel(''); setCompleteStatus('') }}
              />
            </div>
            <div className="mt-2 w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
              {activeYear
                ? `Année active : ${activeYear.label} — ${completeInscriptions.length} inscription(s)`
                : "Aucune année scolaire active"}
            </div>
          </div>
          <RenderTable
            renderCondition={!!activeYear}
            renderFailText={NO_ACTIVE_MSG}
            noContentText="Aucune inscription trouvée"
            contents={completeInscriptions}
            titleBadge="full_name"
            badgeContent={BADGE_CONTENT}
            clickoutside="complete-inscriptions"
            actions={completeActions}
          />
        </Card>

      </div>

      {<div>
        <Card>
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-sm text-slate-700 mb-2">Resultat de l'étudiant</h3>
          </div>
          {bulletins.length === 0
            ? "Aucune donnée trouvée"
            : (
              <div>
                {bulletins.map((bulletin) => {
                  return <Bulletin
                    key={bulletin.id}
                    results={bulletin.results}
                    formation={bulletin.formation}
                    level={bulletin.level}
                    school_year={bulletin.school_year}
                    semester={bulletin.semester}
                    student={bulletin.student}
                  />
                })}
              </div>
            )
          }
        </Card>
      </div>}
    </div>
  )
}