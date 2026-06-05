import React from 'react';

const StatusBadge = ({ status }) => {
  let colorClass = "bg-slate-100 text-slate-600";
  let text = status;

  if (status === 'COMPLETED') {
    colorClass = "bg-green-100 text-green-700";
    text = "Terminé";
  } else if (status === 'PENDING') {
    colorClass = "bg-yellow-100 text-yellow-700";
    text = "En attente";
  } else if (status === 'PROGRESS') {
    colorClass = "bg-blue-100 text-blue-700";
    text = "En cours";
  } else if (status === 'FAILED') {
    colorClass = "bg-red-100 text-red-700";
    text = "Échoué";
  }

  return (
    <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${colorClass}`}>
      {text}
    </span>
  );
};

export default function RecentImportsTable({ imports = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-slate-50 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-sm font-semibold text-slate-800">Dernières tâches d'importation</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Statut</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Progression</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Succès / Erreurs</th>
              <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {imports.length > 0 ? (
              imports.map((job) => (
                <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-semibold text-slate-700">{job.import_type}</td>
                  <td className="py-4 px-6"><StatusBadge status={job.status} /></td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {job.processed_rows} / {job.total_rows}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <span className="text-green-600 font-medium">{job.success_count}</span>
                    <span className="text-slate-300 mx-1">|</span>
                    <span className="text-red-500 font-medium">{job.error_count}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-500">
                    {new Date(job.created_at).toLocaleString('fr-FR')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-12 text-center text-sm text-slate-400">
                  Aucun historique d'importation.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
