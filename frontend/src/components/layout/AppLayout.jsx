import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar  from './Navbar'

/**
 * AppLayout — shell with sidebar + topbar + main content area
 * Used for all authenticated pages (étudiant & enseignant).
 */
export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar/>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}