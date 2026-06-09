import React from 'react';

const CalendarIcon = () => (
  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-4 h-4 text-slate-400 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChevronLeft = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default function WeeklyScheduleTable({ scheduleEntries = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-slate-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <CalendarIcon />
          <h2 className="text-sm font-semibold text-slate-800">Emploi du temps hebdomadaire</h2>
        </div>
        <div className="flex items-center bg-slate-100 rounded-md p-1">
          <span className="text-xs font-medium text-slate-600 px-3">Semaine en cours</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jour</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Heure</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Classe</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Élément Constitutif (EC)</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Salle</th>
            </tr>
          </thead>
          <tbody>
            {scheduleEntries.length > 0 ? (
              scheduleEntries.map((entry, idx) => (
                <tr key={entry.id || idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="py-4 px-6 text-sm font-semibold text-slate-800 capitalize">{entry.day}</td>
                  <td className="py-4 px-6 text-sm text-slate-500">{entry.start_time} - {entry.end_time}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-800 text-white text-[10px] font-bold tracking-wide">
                      {entry.classe}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-slate-700">{entry.ec}</td>
                  <td className="py-4 px-6 text-sm text-slate-500 flex items-center">
                    <LocationIcon />
                    {entry.room || "Non définie"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-12 text-center text-sm text-slate-400">
                  Aucun cours prévu pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
