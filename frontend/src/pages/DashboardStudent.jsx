import React from 'react';
import { useStudentDashboard } from '../hooks/dashboard/useStudentDashboard';
import TeacherStatCard from '../components/dashboard/TeacherStatCard';
import WeeklyScheduleTable from '../components/dashboard/WeeklyScheduleTable';
import RecentGradesList from '../components/dashboard/RecentGradesList';
import { useAuth } from '../context/AuthContext';

// Icons for Stat Cards
const BookIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const ClipboardCheckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const DashboardStudent = () => {
  const { user } = useAuth();
  const { data, isLoading, isError } = useStudentDashboard();

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
    active_modules_count = 0,
    upcoming_exams = 0,
    recent_grades = [],
    weekly_schedule = []
  } = data || {};

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Bonjour, {user?.first_name || "Étudiant"} !</h1>
        <p className="text-slate-500 mt-1">Voici le résumé de votre scolarité.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TeacherStatCard 
          icon={BookIcon} 
          title="Modules Actifs" 
          value={active_modules_count} 
          iconColorClass="text-red-500" 
          iconBgClass="bg-red-50" 
        />
        <TeacherStatCard 
          icon={ClipboardCheckIcon} 
          title="Examens à venir" 
          value={upcoming_exams} 
          iconColorClass="text-red-500" 
          iconBgClass="bg-red-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Schedule */}
        <section className="lg:col-span-2">
          <WeeklyScheduleTable scheduleEntries={weekly_schedule} />
        </section>

        {/* Recent Grades */}
        <section className="lg:col-span-1">
          <RecentGradesList grades={recent_grades} />
        </section>
      </div>

    </div>
  );
};

export default DashboardStudent;
