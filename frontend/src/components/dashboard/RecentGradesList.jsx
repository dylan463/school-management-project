import React from 'react';

const DocumentIcon = () => (
  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default function RecentGradesList({ grades = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-slate-50 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <DocumentIcon />
          <h2 className="text-sm font-semibold text-slate-800">Dernières Notes</h2>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {grades.length > 0 ? (
          grades.map((grade) => (
            <div key={grade.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-sm font-semibold text-slate-800">{grade.module}</p>
                <p className="text-xs text-slate-500">{grade.assessment_name} • {new Date(grade.date).toLocaleDateString()}</p>
              </div>
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold ${
                  grade.score >= 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {grade.score} / 20
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-sm text-slate-400">
            Aucune note disponible.
          </div>
        )}
      </div>
    </div>
  );
}
