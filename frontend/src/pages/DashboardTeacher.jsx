import React from 'react';
import { useTeacherDashboard } from '../hooks/dashboard/useTeacherDashboard';
import TeacherStatCard from '../components/dashboard/TeacherStatCard';
import WeeklyScheduleTable from '../components/dashboard/WeeklyScheduleTable';
import { useAuth } from '../context/AuthContext';

// Icons for Stat Cards
const BookIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const NetworkIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM9 8h2v5a2 2 0 01-2 2H6m5-2h4" />
  </svg>
);

const ClipboardCheckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const DashboardTeacher = () => {
  const { user } = useAuth();
  const { data, isLoading, isError } = useTeacherDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100">
        Une erreur est survenue lors du chargement des données du tableau de bord.
      </div>
    );
  }

  const {
    active_courses_count = 0,
    total_students = 0,
    classes_count = 0,
    upcoming_exams = 0,
    weekly_schedule = []
  } = data || {};

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Bonjour, {user?.first_name || "Enseignant"} !</h1>
        <p className="text-slate-500 mt-1">Voici le résumé de vos activités pour aujourd'hui.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TeacherStatCard 
          icon={BookIcon} 
          title="Cours Actifs" 
          value={active_courses_count} 
          iconColorClass="text-red-500" 
          iconBgClass="bg-red-50" 
        />
        <TeacherStatCard 
          icon={UsersIcon} 
          title="Total Étudiants" 
          value={total_students} 
          iconColorClass="text-red-500" 
          iconBgClass="bg-red-50" 
        />
        <TeacherStatCard 
          icon={NetworkIcon} 
          title="Classes" 
          value={classes_count} 
          iconColorClass="text-red-500" 
          iconBgClass="bg-red-50" 
        />
        <TeacherStatCard 
          icon={ClipboardCheckIcon} 
          title="Examens Prévus" 
          value={upcoming_exams} 
          iconColorClass="text-red-500" 
          iconBgClass="bg-red-50" 
        />
      </div>

      {/* Weekly Schedule */}
      <section>
        <WeeklyScheduleTable scheduleEntries={weekly_schedule} />
      </section>

    </div>
  );
};

export default DashboardTeacher;
