import { useState } from "react"
import SchedulesPanel from "../components/panel/SchedulesPanel"
import ScheduleDetailsPanel from "../components/panel/ScheduleDetailsPanel"
import TeacherAvailabilitiesPanel from "../components/panel/TeacherAvailabilitiesPanel"
import { useAuth } from "../context/AuthContext"
import { ROLES } from "../utils/constants"

const Schedule = () => {
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const { role } = useAuth()

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <section className="space-y-4">
        <header>
          <h1 className="text-2xl font-bold text-slate-800">
            Gestion des Emplois du temps
          </h1>
          <p className="text-sm text-slate-500 mb-4">
            Consultez et créez les emplois du temps pour chaque parcours et semestre.
          </p>
        </header>

        {role === ROLES.TEACHER && !selectedSchedule && (
          <TeacherAvailabilitiesPanel />
        )}

        {selectedSchedule ? (
          <ScheduleDetailsPanel 
            schedule={selectedSchedule} 
            onBack={() => setSelectedSchedule(null)} 
          />
        ) : (
          <SchedulesPanel onSelectSchedule={setSelectedSchedule} />
        )}
      </section>
    </div>
  )
}

export default Schedule
