import { Routes, Route, Navigate } from 'react-router-dom'
import { ROLES, ROUTES } from '../utils/constants'

import PrivateRoute   from './PrivateRoute'
import RoleRoute      from './RoleRoute'

// Public
import LandingPage    from '../pages/auth/LandingPage'
import LoginPage      from '../pages/auth/LoginPage'

// Layouts
import AppLayout      from '../components/layout/AppLayout'

// Étudiant pages
import DashboardEtudiant   from '../pages/etudiant/DashboardEtudiant'
import NotesPage           from '../pages/etudiant/NotesPage'
import EmploiDuTempsPage   from '../pages/etudiant/EmploiDuTempsPage'
import CoursPage           from '../pages/etudiant/CoursPage'
import PointagePage        from '../pages/etudiant/PointagePage'

// Enseignant pages
import DashboardEnseignant from '../pages/enseignant/DashboardEnseignant'
import EtudiantsPage       from '../pages/enseignant/EtudiantsPage'
import SaisieNotesPage     from '../pages/enseignant/SaisieNotesPage'
import PlanningPage        from '../pages/enseignant/PlanningPage'
import RessourcesPage      from '../pages/enseignant/RessourcesPage'

export default function AppRouter() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path={ROUTES.HOME}  element={<LandingPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* ── Étudiant (protected) ── */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleRoute allowedRole={ROLES.ETUDIANT} />}>
          <Route element={<AppLayout role={ROLES.ETUDIANT} />}>
            <Route path={ROUTES.DASHBOARD_ETU}   element={<DashboardEtudiant />} />
            <Route path={ROUTES.NOTES}            element={<NotesPage />} />
            <Route path={ROUTES.EMPLOI_DU_TEMPS} element={<EmploiDuTempsPage />} />
            <Route path={ROUTES.COURS}            element={<CoursPage />} />
            <Route path={ROUTES.POINTAGE}         element={<PointagePage />} />
          </Route>
        </Route>
      </Route>

      {/* ── Enseignant (protected) ── */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleRoute allowedRole={ROLES.ENSEIGNANT} />}>
          <Route element={<AppLayout role={ROLES.ENSEIGNANT} />}>
            <Route path={ROUTES.DASHBOARD_ENS}   element={<DashboardEnseignant />} />
            <Route path={ROUTES.ETUDIANTS_LIST}  element={<EtudiantsPage />} />
            <Route path={ROUTES.SAISIE_NOTES}    element={<SaisieNotesPage />} />
            <Route path={ROUTES.PLANNING}        element={<PlanningPage />} />
            <Route path={ROUTES.RESSOURCES}      element={<RessourcesPage />} />
          </Route>
        </Route>
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}