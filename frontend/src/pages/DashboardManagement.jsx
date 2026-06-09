import React from 'react';
import { useManagementDashboard } from '../hooks/dashboard/useManagementDashboard';
import TeacherStatCard from '../components/dashboard/TeacherStatCard';
import { useAuth } from '../context/AuthContext';

// Icons for Stat Cards
const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const TeacherIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const NetworkIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zM9 8h2v5a2 2 0 01-2 2H6m5-2h4" />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const DashboardManagement = () => {
  const { user } = useAuth();
  const { data, isLoading, isError } = useManagementDashboard();

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
    total_students = 0,
    total_teachers = 0,
    active_formations = 0,
    ongoing_imports = 0,
    recent_imports = []
  } = data || {};

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Espace Administration ({user?.mention?.code || "Département"})</h1>
        <p className="text-slate-500 mt-1">Vue d'ensemble de la gestion du département {user?.mention?.text || ""}.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TeacherStatCard 
          icon={UsersIcon} 
          title="Total Étudiants" 
          value={total_students} 
          iconColorClass="text-red-500" 
          iconBgClass="bg-red-50" 
        />
        <TeacherStatCard 
          icon={TeacherIcon} 
          title="Total Enseignants" 
          value={total_teachers} 
          iconColorClass="text-red-500" 
          iconBgClass="bg-red-50" 
        />
        <TeacherStatCard 
          icon={NetworkIcon} 
          title="Parcours Actifs" 
          value={active_formations} 
          iconColorClass="text-red-500" 
          iconBgClass="bg-red-50" 
        />
        <TeacherStatCard 
          icon={RefreshIcon} 
          title="Imports en cours" 
          value={ongoing_imports} 
          iconColorClass="text-red-500" 
          iconBgClass="bg-red-50" 
        />
      </div>
    </div>
  );
};

export default DashboardManagement;
