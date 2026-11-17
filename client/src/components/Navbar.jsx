import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Award,
  Rocket,
  Building2,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Briefcase,
  Users,
  CheckSquare,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar({ activeTab, onSelectTab }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navItems = [
    {
      id: 'dashboard',
      label: user?.role === 'INSTITUTION_ADMIN' ? 'Admin Console' : 'Dashboard',
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
    },
    {
      id: 'internships',
      label:
        user?.role === 'MENTOR'
          ? 'My Interns'
          : user?.role === 'INSTITUTION_ADMIN'
          ? 'Interns & Cohorts'
          : 'My Cohort',
      icon:
        user?.role === 'MENTOR' ? (
          <Users className="w-3.5 h-3.5" />
        ) : (
          <Briefcase className="w-3.5 h-3.5" />
        ),
    },
    {
      id: 'tasks',
      label: 'Tasks & Kanban',
      icon: <CheckSquare className="w-3.5 h-3.5" />,
    },
    {
      id: 'evaluations',
      label: 'Evaluations & Reports',
      icon: <Award className="w-3.5 h-3.5" />,
    },
    ...(user?.role === 'INSTITUTION_ADMIN'
      ? [
          {
            id: 'users',
            label: 'Directory',
            icon: <Users className="w-3.5 h-3.5" />,
          },
        ]
      : []),
  ];

  const handleSelectTab = (tabId) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-slate-800/80">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-glow font-bold text-white text-lg flex-shrink-0">
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

        {/* Central Navigation Tabs (Desktop only) */}
        {user && onSelectTab && (
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        )}

        {/* Right Info & Actions */}
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Institution Badge (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700 text-xs text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium text-slate-200">{user.institution?.name}</span>
            </div>

            {/* Role Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold ${badge.classes}`}>
              {badge.icon}
              <span>{badge.label}</span>
            </div>

            {/* User & Logout */}
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800">
              <span className="text-xs font-semibold text-white hidden sm:inline">
                {user.firstName}
              </span>
              <button
                onClick={logout}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-indigo-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>API Online</span>
          </div>
        )}
      </div>

      {/* Mobile Horizontal Scrolling Tabs Bar (Always visible on mobile when logged in) */}
      {user && onSelectTab && (
        <nav className="md:hidden flex items-center gap-1.5 overflow-x-auto px-3 sm:px-4 py-2 border-t border-slate-800/70 bg-slate-950/85 no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800/80'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Mobile Collapsible Drawer Panel (When hamburger is clicked) */}
      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Profile Card */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">{user.firstName} {user.lastName}</div>
                <div className="text-[11px] text-slate-400">{user.email}</div>
              </div>
              <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badge.classes}`}>
                {badge.icon}
                <span>{badge.label}</span>
              </div>
            </div>
            {user.institution && (
              <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-1 border-t border-slate-800/60">
                <Building2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="truncate">{user.institution.name}</span>
              </div>
            )}
          </div>

          {/* Navigation Items List */}
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2 mb-1">
              Platform Navigation
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white shadow-glow'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {activeTab === item.id && (
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full uppercase">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Mobile Sign Out Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      )}
    </header>
  );
}
