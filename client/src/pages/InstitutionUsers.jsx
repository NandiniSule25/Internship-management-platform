import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Award, Rocket, Shield, Mail, Phone, Calendar, Search } from 'lucide-react';

export default function InstitutionUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const res = await axios.get('/api/institutions/me/users');
        if (res.data?.users) {
          setUsers(res.data.users);
        }
      } catch (err) {
        console.error('Failed to load institution users:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      return fullName.includes(term) || u.email.toLowerCase().includes(term);
    }
    return true;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'INSTITUTION_ADMIN':
        return { label: 'Admin', class: 'bg-violet-500/10 text-violet-400 border-violet-500/30' };
      case 'MENTOR':
        return { label: 'Mentor', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'INTERN':
      default:
        return { label: 'Intern', class: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 text-indigo-400" />
            <span>Institution Mentors & Interns Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Registered faculty mentors, company supervisors, and student interns under {user?.institution?.name}.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="glass-input text-xs pl-8 pr-3 py-1.5 rounded-xl w-60"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            {['ALL', 'MENTOR', 'INTERN'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  roleFilter === r ? 'bg-indigo-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : `${r}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">Loading institution directory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((u) => {
            const badge = getRoleBadge(u.role);
            return (
              <div
                key={u.id}
                className="glass-card p-5 rounded-2xl border-slate-800 bg-slate-900/60 glass-card-hover flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${badge.class}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">
                      {u.firstName} {u.lastName}
                    </h3>
                    <p className="text-xs text-indigo-400 font-mono flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{u.email}</span>
                    </p>
                  </div>

                  {u.phone && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{u.phone}</span>
                    </p>
                  )}
                </div>

                {/* Cohort load info */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {u.role === 'MENTOR' ? 'Cohorts Mentoring:' : 'Cohorts Enrolled:'}
                  </span>
                  <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono">
                    {u.role === 'MENTOR' ? u._count?.mentoredInternships || 0 : u._count?.internships || 0}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredUsers.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              <p className="text-sm">No members found matching the search criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
