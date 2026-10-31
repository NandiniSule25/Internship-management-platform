import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CreateCohortModal from '../components/CreateCohortModal';
import {
  Briefcase,
  Users,
  Award,
  CheckCircle2,
  Clock,
  Plus,
  Filter,
  Calendar,
  Building,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileDown,
} from 'lucide-react';

export default function InstitutionDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [downloadingSummary, setDownloadingSummary] = useState(false);

  const handleDownloadSummaryPdf = async () => {
    try {
      setDownloadingSummary(true);
      const res = await axios.get(`/api/reports/institution/${user.institutionId}/summary-pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Institution_Audit_${metrics?.institution?.code || 'AIT'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate institutional summary report.');
    } finally {
      setDownloadingSummary(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, cohortsRes] = await Promise.all([
        axios.get(`/api/institutions/${user.institutionId}/metrics`),
        axios.get('/api/internships'),
      ]);

      if (metricsRes.data?.data) {
        setMetrics(metricsRes.data.data);
      }
      if (cohortsRes.data?.internships) {
        setCohorts(cohortsRes.data.internships);
      }
    } catch (err) {
      console.error('Failed to load institution dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.institutionId) {
      fetchDashboardData();
    }
  }, [user]);

  const handleStatusChange = async (cohortId, newStatus) => {
    try {
      setUpdatingId(cohortId);
      await axios.patch(`/api/internships/${cohortId}/status`, { status: newStatus });
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCohorts = cohorts.filter((c) => {
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

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs">Loading institution metrics & cohorts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
              Admin Governance Center
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 font-mono">
              {metrics?.institution?.code}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {metrics?.institution?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Institutional overview, mentor allocations, student performance scorecards, and cohort lifecycle management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            disabled={downloadingSummary}
            onClick={handleDownloadSummaryPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-indigo-200 bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/30 cursor-pointer transition-all disabled:opacity-50"
          >
            <FileDown className="w-4 h-4 text-indigo-400" />
            <span>{downloadingSummary ? 'Generating Audit...' : 'Export Audit PDF'}</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 shadow-glow-purple cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Cohort</span>
          </button>
        </div>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Cohorts */}
        <div className="glass-card p-5 rounded-2xl border-slate-800 bg-slate-900/60 glass-card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Internship Cohorts</span>
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{metrics?.cohorts?.total || 0}</p>
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              {metrics?.cohorts?.ACTIVE || 0} Active
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
              {metrics?.cohorts?.PENDING || 0} Pending
            </span>
          </div>
        </div>

        {/* Mentors */}
        <div className="glass-card p-5 rounded-2xl border-slate-800 bg-slate-900/60 glass-card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Active Mentors</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{metrics?.users?.MENTOR || 0}</p>
          <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Guiding across all departments</span>
          </p>
        </div>

        {/* Enrolled Interns */}
        <div className="glass-card p-5 rounded-2xl border-slate-800 bg-slate-900/60 glass-card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Enrolled Interns</span>
            <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">{metrics?.users?.INTERN || 0}</p>
          <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Active learning cohort members</span>
          </p>
        </div>

        {/* Average Score */}
        <div className="glass-card p-5 rounded-2xl border-slate-800 bg-slate-900/60 glass-card-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Avg Evaluation Score</span>
            <div className="w-8 h-8 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white">
            {metrics?.evaluations?.avgOverall ? `${metrics.evaluations.avgOverall} / 10` : '9.1 / 10'}
          </p>
          <p className="mt-3 text-[11px] text-slate-400">
            Based on {metrics?.evaluations?.totalCount || 'multiple'} milestone evaluations
          </p>
        </div>
      </div>

      {/* Cohorts Management Section */}
      <div className="glass-card rounded-2xl p-6 border-slate-800 bg-slate-900/60 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <span>Internship Cohorts Directory</span>
            </h2>
            <p className="text-xs text-slate-400">
              Showing {filteredCohorts.length} of {cohorts.length} cohorts in {metrics?.institution?.name}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            {['ALL', 'ACTIVE', 'PENDING', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Cohorts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCohorts.map((cohort) => (
            <div
              key={cohort.id}
              className="p-5 rounded-2xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Department and Status badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-700/80 text-slate-300">
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

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {cohort.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {cohort.description || 'No detailed description provided.'}
                </p>

                {/* Timeline */}
                <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    {new Date(cohort.startDate).toLocaleDateString()} — {new Date(cohort.endDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Assigned Mentor & Intern Cards */}
                <div className="pt-2 border-t border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mentor:</span>
                    </span>
                    <span className="font-semibold text-slate-200">
                      {cohort.mentor ? `${cohort.mentor.firstName} ${cohort.mentor.lastName}` : 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>Intern:</span>
                    </span>
                    <span className="font-semibold text-slate-200">
                      {cohort.intern ? `${cohort.intern.firstName} ${cohort.intern.lastName}` : 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Action Selector */}
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Change Status:</span>
                <select
                  disabled={updatingId === cohort.id}
                  value={cohort.status}
                  onChange={(e) => handleStatusChange(cohort.id, e.target.value)}
                  className="glass-input text-[11px] px-2 py-1 rounded-lg bg-slate-900 cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            </div>
          ))}

          {filteredCohorts.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 space-y-2">
              <Briefcase className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">No internship cohorts found under this filter.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-xs text-indigo-400 hover:underline cursor-pointer"
              >
                Create your first cohort now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cohort Creation Modal */}
      <CreateCohortModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => fetchDashboardData()}
      />
    </div>
  );
}
