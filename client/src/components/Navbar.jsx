import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Award, Rocket, Building2, LogOut, Sparkles, LayoutDashboard, Briefcase, Users, CheckSquare } from 'lucide-react';

export default function Navbar({ activeTab, onSelectTab }) {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'INSTITUTION_ADMIN':
        return {
          label: 'Admin',
          icon: <Shield className="w-3.5 h-3.5" />,
          classes: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-glow-purple',
        };
      case 'MENTOR':
        return {
          label: 'Mentor',
          icon: <Award className="w-3.5 h-3.5" />,
          classes: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-glow-emerald',
        };
      case 'INTERN':
        return {
          label: 'Intern',
          icon: <Rocket className="w-3.5 h-3.5" />,
          classes: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-glow-amber',
        };
      default:
        return {
          label: role,
          icon: <Sparkles className="w-3.5 h-3.5" />,
          classes: 'bg-slate-700 text-slate-200',
        };
    }
  };

  const badge = user ? getRoleBadge(user.role) : null;

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-glow font-bold text-white text-lg">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                InternSphere
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hidden sm:inline">
                Multi-Institution
              </span>
            </div>
          </div>
        </div>

        {/* Central Navigation Tabs (When logged in) */}
        {user && onSelectTab && (
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{user.role === 'INSTITUTION_ADMIN' ? 'Admin Console' : 'Dashboard'}</span>
            </button>

            <button
              onClick={() => onSelectTab('internships')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'internships'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Cohorts</span>
            </button>

            <button
              onClick={() => onSelectTab('tasks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Tasks & Kanban</span>
            </button>

            <button
              onClick={() => onSelectTab('evaluations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTab === 'evaluations'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Evaluations & Reports</span>
            </button>

            {user.role === 'INSTITUTION_ADMIN' && (
              <button
                onClick={() => onSelectTab('users')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Directory</span>
              </button>
            )}
          </nav>
        )}

        {/* Right Info & Actions */}
        {user ? (
          <div className="flex items-center gap-3">
            {/* Institution Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700 text-xs text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium text-slate-200">{user.institution?.name}</span>
            </div>

            {/* Role Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.classes}`}>
              {badge.icon}
              <span>{badge.label}</span>
            </div>

            {/* User & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <span className="text-xs font-semibold text-white hidden sm:inline">
                {user.firstName}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>API Online (Port 5001)</span>
          </div>
        )}
      </div>
    </header>
  );
}
