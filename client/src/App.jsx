import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import DashboardHub from './pages/DashboardHub';
import InstitutionDashboard from './pages/InstitutionDashboard';
import InternshipsList from './pages/InternshipsList';
import InstitutionUsers from './pages/InstitutionUsers';
import TaskBoard from './pages/TaskBoard';
import EvaluationsView from './pages/EvaluationsView';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCohort, setSelectedCohort] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b14] text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Loading Internship Platform...
          </p>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    if (!user) return <AuthPage />;

    if (activeTab === 'users' && user.role === 'INSTITUTION_ADMIN') {
      return <InstitutionUsers />;
    }

    if (activeTab === 'internships') {
      return <InternshipsList onSelectCohort={(cohort) => setSelectedCohort(cohort)} />;
    }

    if (activeTab === 'tasks') {
      return <TaskBoard />;
    }

    if (activeTab === 'evaluations') {
      return <EvaluationsView />;
    }

    // Default dashboard tab
    if (user.role === 'INSTITUTION_ADMIN') {
      return <InstitutionDashboard />;
    }

    return <DashboardHub />;
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans">
      <Navbar activeTab={activeTab} onSelectTab={(tab) => { setActiveTab(tab); setSelectedCohort(null); }} />
      <main className="flex-1">
        {renderActiveView()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
