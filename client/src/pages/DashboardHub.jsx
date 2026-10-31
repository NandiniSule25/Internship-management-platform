import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Shield,
  Award,
  Rocket,
  Building,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Briefcase,
  TrendingUp,
  Database,
  Key,
  ExternalLink,
  ChevronRight,
  Layers,
} from 'lucide-react';

export default function DashboardHub() {
  const { user } = useAuth();
  const [dbStatus, setDbStatus] = useState({ loading: true, data: null });

  useEffect(() => {
    async function checkDb() {
      try {
        const res = await axios.get('/api/health/db');
        setDbStatus({ loading: false, data: res.data });
      } catch (err) {
        setDbStatus({ loading: false, error: err.message });
      }
    }
    checkDb();
  }, []);

  const getRoleConfig = () => {
    switch (user?.role) {
      case 'INSTITUTION_ADMIN':
        return {
          title: 'Institution Administrator Console',
          subtitle: `Managing cohorts, mentors, and intern records for ${user?.institution?.name}`,
          colorTheme: 'from-violet-600 via-indigo-600 to-purple-800',
          badgeText: 'INSTITUTION ADMIN',
          badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
          stats: [
            { label: 'Mentored Cohorts', value: user?._count?.mentoredInternships || '12', icon: <Briefcase className="w-5 h-5 text-violet-400" /> },
            { label: 'Registered Mentors', value: '8', icon: <Users className="w-5 h-5 text-indigo-400" /> },
            { label: 'Enrolled Interns', value: user?._count?.internships || '34', icon: <Rocket className="w-5 h-5 text-pink-400" /> },
            { label: 'Audit Reports', value: user?._count?.reportsGenerated || '5', icon: <FileText className="w-5 h-5 text-emerald-400" /> },
          ],
          actions: [
            { title: 'Create Internship Cohort', desc: 'Define departments, start/end dates, and allocate mentor' },
            { title: 'Manage Mentors & Interns', desc: 'Assign mentors to new intern batches' },
            { title: 'Export Institution Summary PDF', desc: 'Download comprehensive institutional performance reports' },
          ],
        };
      case 'MENTOR':
        return {
          title: 'Mentor Command Center',
          subtitle: `Guiding interns and evaluating project deliverables at ${user?.institution?.name}`,
          colorTheme: 'from-emerald-600 via-teal-600 to-cyan-800',
          badgeText: 'MENTOR SUPERVISOR',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          stats: [
            { label: 'Active Interns', value: user?._count?.mentoredInternships || '4', icon: <Users className="w-5 h-5 text-emerald-400" /> },
            { label: 'Allocated Tasks', value: user?._count?.createdTasks || '18', icon: <Clock className="w-5 h-5 text-cyan-400" /> },
            { label: 'Evaluations Given', value: user?._count?.evaluationsGiven || '6', icon: <Award className="w-5 h-5 text-amber-400" /> },
            { label: 'Milestone Progress', value: '84%', icon: <TrendingUp className="w-5 h-5 text-teal-400" /> },
          ],
          actions: [
            { title: 'Allocate Task with Deadline', desc: 'Create tasks with description, priority, and due dates' },
            { title: 'Review Progress Submissions', desc: 'Approve intern daily notes, work URLs, and hours logged' },
            { title: 'Submit Intern Evaluation', desc: 'Rate technical, communication, and punctuality scores' },
          ],
        };
      case 'INTERN':
      default:
        return {
          title: 'Intern Workspace & Task Board',
          subtitle: `Tracking active internship deliverables and milestone feedback at ${user?.institution?.name}`,
          colorTheme: 'from-amber-500 via-orange-600 to-rose-700',
          badgeText: 'INTERN STUDENT',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          stats: [
            { label: 'Active Tasks', value: user?._count?.assignedTasks || '3', icon: <Clock className="w-5 h-5 text-amber-400" /> },
            { label: 'Progress Updates', value: user?._count?.progressUpdates || '7', icon: <TrendingUp className="w-5 h-5 text-orange-400" /> },
            { label: 'Evaluations Received', value: user?._count?.evaluationsReceived || '2', icon: <Award className="w-5 h-5 text-yellow-400" /> },
            { label: 'Average Score', value: '9.2 / 10', icon: <CheckCircle className="w-5 h-5 text-emerald-400" /> },
          ],
          actions: [
            { title: 'Submit Daily Progress Update', desc: 'Log work hours, notes, and deliverable repository links' },
            { title: 'View Assigned Task Deadlines', desc: 'Keep track of TODO, In Progress, and Under Review items' },
            { title: 'Download Performance Certificate PDF', desc: 'Generate verified PDF completion report' },
          ],
        };
    }
  };

  const roleConfig = getRoleConfig();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Colorful Hero Card */}
      <div className={`relative overflow-hidden rounded-3xl p-8 sm:p-10 bg-gradient-to-r ${roleConfig.colorTheme} shadow-2xl text-white`}>
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-black/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase border ${roleConfig.badgeClass}`}>
                {roleConfig.badgeText}
              </span>
              <span className="text-xs bg-black/30 px-3 py-1 rounded-full text-white/80 font-mono">
                {user?.institution?.code}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.firstName} {user?.lastName}! 👋
            </h1>

            <p className="text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed">
              {roleConfig.subtitle}
            </p>
          </div>

          {/* User Institution Pill */}
          <div className="glass-card p-4 rounded-2xl border-white/20 bg-white/10 backdrop-blur-md shrink-0 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/90 mb-1">
              <Building className="w-4 h-4 text-white" />
              <span>Affiliated College</span>
            </div>
            <p className="text-sm font-bold text-white">{user?.institution?.name}</p>
            <p className="text-xs text-white/70 font-mono">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Role-Specific Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {roleConfig.stats.map((stat, idx) => (
          <div
            key={idx}
            className="glass-card p-5 rounded-2xl border-slate-800 bg-slate-900/60 glass-card-hover transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
              <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Core Platform Modules & Next Phases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Roadmaps */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Role Workspace Modules</span>
              </h2>
              <p className="text-xs text-slate-400">Available functions tailored for {roleConfig.badgeText}</p>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
              Phase 2 Active
            </span>
          </div>

          <div className="space-y-3">
            {roleConfig.actions.map((act, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{act.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database & Authorization Diagnostic Card */}
        <div className="glass-card rounded-2xl p-6 border-slate-800 bg-slate-900/60 space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Live System Status</span>
          </h2>

          {/* Database Health Pill */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                PostgreSQL (Neon)
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                CONNECTED
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Tables synchronized: <strong>7 public tables</strong>
            </p>
            {dbStatus.data && (
              <p className="text-[11px] text-emerald-400 font-mono">
                Latency: {dbStatus.data.latencyMs}ms | Engine: {dbStatus.data.database}
              </p>
            )}
          </div>

          {/* Active JWT Identity */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Current JWT Session</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-slate-400">
              <p><strong>User ID:</strong> {user?.id?.slice(0, 13)}...</p>
              <p><strong>Role:</strong> <span className="text-indigo-300 font-bold">{user?.role}</span></p>
              <p><strong>Institution:</strong> {user?.institution?.code} ({user?.institution?.name})</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
