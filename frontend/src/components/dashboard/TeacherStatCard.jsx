import React from 'react';

export default function TeacherStatCard({ icon: Icon, title, value, iconColorClass = "text-red-500", iconBgClass = "bg-red-50" }) {
  return (
    <div className="bg-white rounded-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] p-6 flex flex-col justify-between border border-slate-50 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.15)]">
      <div className="flex justify-start mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgClass}`}>
          {Icon && <Icon className={`w-5 h-5 ${iconColorClass}`} />}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-4xl font-light tracking-tight text-slate-800">{value < 10 && value > 0 ? `0${value}` : value}</h3>
      </div>
    </div>
  );
}
