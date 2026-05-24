import { Routes, Route, Navigate } from 'react-router-dom'
import { ROLES, ROUTES } from '../utils/constants'

import ProtectedRoute from './ProtectedRoute'
import InfoPerso from '../pages/auth/InfoPerso'
// Public
import LandingPage    from '../pages/auth/LandingPage'
import LoginPage      from '../pages/auth/LoginPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'

// Layouts
import AppLayout      from '../components/layout/AppLayout'

// === ÉTUDIANT ===
import DashboardEtudiant   from '../pages/etudiant/DashboardEtudiant'
import EmploiDuTemps       from '../pages/commun/EmploiDuTemps'

// === ENSEIGNANT ===
import DashboardEnseignant from '../pages/enseignant/DashboardEnseignant'
// === TEACHER ADMIN ===
import DashboardTeacherAdmin from '../pages/admin/DashboardTeacherAdmin'
import Etudiants            from '../pages/admin/Etudiants'
import Enseignants          from '../pages/admin/Enseignants'
import StructuresAcademiques from '../pages/admin/StructuresAcademiques'
import Enseignement          from '../pages/admin/Enseignement'
import Inscriptions          from '../pages/admin/Inscriptions'
import UsersAndMention from '../pages/systemadmin/UsersAndMention'

export default function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.HOME}  element={<LandingPage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      
      <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT,ROLES.DEPARTMENT_SECRETARY,ROLES.DEPARTMENT_HEAD,ROLES.REGISTRAR_OFFICER,ROLES.TEACHER,ROLES.SYSTEM_ADMIN]}/>}>
        <Route element={<AppLayout/>}>
          <Route path={ROUTES.INFORMATIONS} element={<InfoPerso />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT,ROLES.TEACHER,ROLES.DEPARTMENT_HEAD]}/>}>
        <Route element={<AppLayout/>}>
          <Route path={ROUTES.ENSEIGNEMENT}   element={<Enseignement />} />
          <Route path={ROUTES.EMPLOI_DU_TEMPS}   element={<EmploiDuTemps />} />
          <Route path={ROUTES.INSCRIPTIONS}   element={<Inscriptions />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]}/>}>
        <Route element={<AppLayout/>}>
          <Route path={ROUTES.DASHBOARD_ETU}         element={<DashboardEtudiant />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.TEACHER]}/>}>
        <Route element={<AppLayout/>}>
          <Route path={ROUTES.DASHBOARD_ENS}        element={<DashboardEnseignant />} />
        </Route>
      </Route>

      {/* ── TEACHER ADMIN ── */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.DEPARTMENT_HEAD]}/>}>
        <Route element={<AppLayout/>}>
          <Route path={ROUTES.DASHBOARD_ADMIN}      element={<DashboardTeacherAdmin />} />
          <Route path={ROUTES.ETUDIANTS_ADMIN}      element={<Etudiants />} />
          <Route path={ROUTES.ENSEIGNANTS_ADMIN}    element={<Enseignants />} />
          <Route path={ROUTES.STRUCTURES_ADMIN}     element={<StructuresAcademiques />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]}/>}>
        <Route element={<AppLayout/>}>
          <Route path={ROUTES.HEADS_AND_MENTION} element={<UsersAndMention/>} />
        </Route>
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  )
}