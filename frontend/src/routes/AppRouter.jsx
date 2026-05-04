import { Routes, Route, Navigate } from 'react-router-dom'
import { ROLES, ROUTES } from '../utils/constants'

// Public
import LandingPage    from '../pages/auth/LandingPage'
import LoginPage      from '../pages/auth/LoginPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'

// Layouts
import AppLayout      from '../components/layout/AppLayout'

// === ÉTUDIANT ===
import DashboardEtudiant   from '../pages/etudiant/DashboardEtudiant'
import MesInscriptions     from '../pages/etudiant/MesInscriptions'
import MesCours            from '../pages/etudiant/MesCours'
import EmploiDuTemps       from '../pages/etudiant/EmploiDuTemps'

// === ENSEIGNANT ===
import DashboardEnseignant from '../pages/enseignant/DashboardEnseignant'
import MesEtudiants        from '../pages/enseignant/MesEtudiants'
import MesAnnotations      from '../pages/enseignant/MesAnnotations'

// === TEACHER ADMIN ===
import DashboardTeacherAdmin from '../pages/teacher-admin/DashboardTeacherAdmin'
import Etudiants            from '../pages/teacher-admin/Etudiants'
import Enseignants          from '../pages/teacher-admin/Enseignants'
import StructuresAcademiques from '../pages/teacher-admin/StructuresAcademiques'
import Enseignement          from '../pages/teacher-admin/Enseignement'
import Inscriptions          from '../pages/teacher-admin/Inscriptions'

export default function AppRouter() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path={ROUTES.HOME}  element={<LandingPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

      {/* ── ÉTUDIANT ── */}
      <Route element={<AppLayout role={ROLES.ETUDIANT} />}>
        <Route path={ROUTES.DASHBOARD_ETU}         element={<DashboardEtudiant />} />
        <Route path={ROUTES.INSCRIPTIONS_ETU}      element={<MesInscriptions />} />
        <Route path={ROUTES.MES_COURS_ETU}         element={<MesCours />} />
        <Route path={ROUTES.EMPLOI_DU_TEMPS_ETU}   element={<EmploiDuTemps />} />
      </Route>

      {/* ── ENSEIGNANT ── */}
      <Route element={<AppLayout role={ROLES.ENSEIGNANT} />}>
        <Route path={ROUTES.DASHBOARD_ENS}        element={<DashboardEnseignant />} />
        <Route path={ROUTES.MES_ETUDIANTS}        element={<MesEtudiants />} />
        <Route path={ROUTES.MES_ANNOTATIONS}      element={<MesAnnotations />} />
      </Route>

      {/* ── TEACHER ADMIN ── */}
      <Route element={<AppLayout role={ROLES.TEACHER_ADMIN} />}>
        <Route path={ROUTES.DASHBOARD_ADMIN}      element={<DashboardTeacherAdmin />} />
        <Route path={ROUTES.ETUDIANTS_ADMIN}      element={<Etudiants />} />
        <Route path={ROUTES.ENSEIGNANTS_ADMIN}    element={<Enseignants />} />
        <Route path={ROUTES.STRUCTURES_ADMIN}     element={<StructuresAcademiques />} />
        <Route path={ROUTES.ENSEIGNEMENT_ADMIN}   element={<Enseignement />} />
        <Route path={ROUTES.INSCRIPTIONS_ADMIN}   element={<Inscriptions />} />
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}