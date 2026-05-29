import { Routes, Route, Navigate } from 'react-router-dom'
import { ROLES, ROUTES } from '../utils/constants'

import ProtectedRoute from './ProtectedRoute'

// Layouts
import AppLayout from '../components/layout/AppLayout'

// ── Public ──
import Home from '../pages/Home'
import Login from '../pages/Login'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'

// ── Commun (tous les utilisateurs connectés) ──
import Profile from '../pages/Profile'

// ── Étudiant ──
import DashboardStudent from '../pages/DashboardStudent'

// ── Enseignant ──
import DashboardTeacher from '../pages/DashboardTeacher'

// ── Management (head, secretary, officer) ──
import DashboardManagement from '../pages/DashboardManagement'
import MentionsAndHeads from '../pages/MentionsAndHeads'
import Secretaries from '../pages/Secretaries'
import Officers from '../pages/Officers'
import Teachers from '../pages/Teachers'
import Students from '../pages/Students'
import Schoolyears from '../pages/Schoolyears'
import Formations from '../pages/Formations'
import Semesters from '../pages/Semesters'
import Levels from '../pages/Levels'
import CourseUnits from '../pages/CourseUnits'
import CourseModules from '../pages/CourseModules'
import Assessments from '../pages/Assessments'
import Grades from '../pages/Grades'
import Results from '../pages/Results'
import History from '../pages/History'
import Deliberations from '../pages/Deliberations'
import Reenrollment from '../pages/Reenrollment'

import NotFound from '../pages/NotFound'

export default function AppRouter() {
  return (
    <Routes>
      {/* public routes */}
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.FORGOTPASSWORD} element={<ForgotPassword />} />
      <Route path={ROUTES.RESETPASSWORD} element={<ResetPassword />} />

      {/* all connected users */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT, ROLES.TEACHER, ROLES.DEPARTMENT_HEAD, ROLES.DEPARTMENT_SECRETARY, ROLES.REGISTRAR_OFFICER, ROLES.SYSTEM_ADMIN]} />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.PROFIL} element={<Profile />} />
        </Route>
      </Route>

      {/* students */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.DASHBOARDSTUDENT} element={<DashboardStudent />} />
        </Route>
      </Route>

      {/* teachers */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.TEACHER]} />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.DASHBOARDTEACHER} element={<DashboardTeacher />} />
        </Route>
      </Route>

      {/* heads,secretaries and officers */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.DEPARTMENT_HEAD, ROLES.DEPARTMENT_SECRETARY, ROLES.REGISTRAR_OFFICER]} />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.DASHBOARDMANAGEMENT} element={<DashboardManagement />} />
        </Route>
      </Route>

      {/* heads,secretaries,officers and students */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.DEPARTMENT_HEAD, ROLES.DEPARTMENT_SECRETARY, ROLES.REGISTRAR_OFFICER, ROLES.STUDENT]} />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.HISTORY} element={<History />} />
        </Route>
      </Route>

      {/* heads,secretaries,teachers and students */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.DEPARTMENT_HEAD, ROLES.DEPARTMENT_SECRETARY, ROLES.TEACHER, ROLES.STUDENT]} />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.COURSEUNITS} element={<CourseUnits />} />
          <Route path={ROUTES.COURSEMODULES} element={<CourseModules />} />
          <Route path={ROUTES.ASSESSMENTS} element={<Assessments />} />
          <Route path={ROUTES.GRADES} element={<Grades />} />
          <Route path={ROUTES.RESULTS} element={<Results />} />
        </Route>
      </Route>


      {/*  department staff */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.DEPARTMENT_HEAD, ROLES.DEPARTMENT_SECRETARY]} />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.SECRETARIES} element={<Secretaries />} />
          <Route path={ROUTES.OFFICERS} element={<Officers />} />
          <Route path={ROUTES.STUDENTS} element={<Students />} />
          <Route path={ROUTES.TEACHERS} element={<Teachers />} />
          <Route path={ROUTES.SCHOOLYEARS} element={<Schoolyears />} />
          <Route path={ROUTES.FORMATIONS} element={<Formations />} />
          <Route path={ROUTES.SEMESTERS} element={<Semesters />} />
          <Route path={ROUTES.LEVELS} element={<Levels />} />
          <Route path={ROUTES.DELIBERATIONS} element={<Deliberations />} />
          <Route path={ROUTES.REENROLLMENT} element={<Reenrollment />} />
        </Route>
      </Route>

      {/* ── System Admin ── */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]} />}>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.MENTIONS_AND_HEADS} element={<MentionsAndHeads />} />
        </Route>
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
