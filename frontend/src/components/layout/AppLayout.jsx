import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'


/**
 * AppLayout — shell with sidebar + topbar + main content area
 * Used for all authenticated pages (étudiant & enseignant).
 */
export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 ">
      <Sidebar
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden shadow-black">
        {/* <Navbar /> */}
        <main className="flex-1 overflow-y-auto p-6 fade-in bg-[#faf9f7] text-slate-600">
          <Outlet />
        </main>
      </div>
    </div>
  )
}