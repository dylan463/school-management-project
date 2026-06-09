import { useState } from "react"
import SchedulesPanel from "../components/panel/SchedulesPanel"
import ScheduleDetailsPanel from "../components/panel/ScheduleDetailsPanel"
import TeacherAvailabilitiesPanel from "../components/panel/TeacherAvailabilitiesPanel"
import { useAuth } from "../context/AuthContext"
import { ROLES } from "../utils/constants"
import TimetableWidget from "../components/timetable/TimetableWidget"

const Schedule = () => {
  const [detailSchedule, setDetailSchedule] = useState(null)
  const [selectedShedule, setSelectedSchedule] = useState(null)
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

        {role === ROLES.TEACHER && !detailSchedule && (
          <TeacherAvailabilitiesPanel />
        )}

        {detailSchedule ? (
          <ScheduleDetailsPanel 
          schedule={detailSchedule} 
          onBack={() => setDetailSchedule(null)} 
          />
        ) : (
          <>
            <SchedulesPanel onDetailSchedule={setDetailSchedule} onSelectedSchedule={setSelectedSchedule} />
            {selectedShedule && selectedShedule.length > 0 && (
              <TimetableWidget scheduleId={selectedShedule[0].id} />
            )}
          </>
        )}

      </section>
    </div>
  )
}

export default Schedule
