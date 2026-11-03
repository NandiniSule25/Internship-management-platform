import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CohortDetailsModal from '../components/CohortDetailsModal';
import {
  Briefcase,
  Users,
  Award,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  Filter,
  ArrowRight,
} from 'lucide-react';

export default function InternshipsList({ onSelectCohort, onNavigateToTasks }) {
  const { user } = useAuth();
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCohortForModal, setSelectedCohortForModal] = useState(null);

  const loadCohorts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/internships');
      if (res.data?.internships) {
        setCohorts(res.data.internships);
      }
    } catch (err) {
      console.error('Failed to load internships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCohorts();
  }, []);

  const filtered = cohorts.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-glow-emerald';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-glow-amber';
      case 'COMPLETED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-glow';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-indigo-400" />
            <span>
              {user.role === 'MENTOR'
                ? 'Internships Under My Mentorship'
                : user.role === 'INTERN'
                ? 'My Enrolled Internships'
                : 'All Institution Internships'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {user.role === 'MENTOR'
              ? 'Allocate deliverables, review progress submissions, and conduct evaluations.'
              : 'Track deadlines, log daily progress, and view performance milestones.'}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
          {['ALL', 'ACTIVE', 'PENDING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === st ? 'bg-indigo-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">Loading internships...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cohort) => (
            <div
              key={cohort.id}
              className="glass-card p-6 rounded-2xl border-slate-800 bg-slate-900/60 glass-card-hover flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {cohort.department}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      cohort.status
                    )}`}
                  >
                    {cohort.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white line-clamp-2">{cohort.title}</h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {cohort.description || 'Comprehensive internship programme and deliverables.'}
                </p>

                {/* Date range */}
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {new Date(cohort.startDate).toLocaleDateString()} — {new Date(cohort.endDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Supervisor & Student card */}
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-emerald-400" /> Mentor:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {cohort.mentor ? `${cohort.mentor.firstName} ${cohort.mentor.lastName}` : 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-400" /> Intern:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {cohort.intern ? `${cohort.intern.firstName} ${cohort.intern.lastName}` : 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {cohort._count?.tasks || 0} Tasks Assigned
                </span>
                <button
                  onClick={() => {
                    setSelectedCohortForModal(cohort.id);
                    if (onSelectCohort) onSelectCohort(cohort);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-indigo-600/80 hover:bg-indigo-600 cursor-pointer transition-all shadow-glow"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              <p className="text-sm">No internships found under this view.</p>
            </div>
          )}
        </div>
      )}

      {/* Cohort Details Modal */}
      <CohortDetailsModal
        cohortId={selectedCohortForModal}
        isOpen={Boolean(selectedCohortForModal)}
        onClose={() => setSelectedCohortForModal(null)}
        onNavigateToTasks={(cohortId) => {
          setSelectedCohortForModal(null);
          if (onNavigateToTasks) onNavigateToTasks(cohortId);
        }}
        onCohortUpdated={loadCohorts}
      />
    </div>
  );
}
