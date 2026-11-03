import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Briefcase,
  Calendar,
  Clock,
  Users,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function CohortDetailsModal({ cohortId, isOpen, onClose, onNavigateToTasks, onCohortUpdated }) {
  const { user } = useAuth();
  const [cohort, setCohort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  useEffect(() => {
    if (isOpen && cohortId) {
      fetchCohortDetails();
    }
  }, [isOpen, cohortId]);

  const fetchCohortDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/internships/${cohortId}`);
      if (res.data?.internship) {
        setCohort(res.data.internship);
      }
    } catch (err) {
      console.error('Failed to load cohort details:', err);
      setError(err.response?.data?.message || 'Failed to load cohort details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await axios.patch(`/api/internships/${cohortId}/status`, { status: newStatus });
      await fetchCohortDetails();
      if (onCohortUpdated) onCohortUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update cohort status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDownloadCertificate = async (internId) => {
    try {
      setDownloadingCert(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/reports/intern/${internId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate-${cohort?.title?.replace(/\s+/g, '_') || 'Intern'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download certificate error:', err);
      alert('Unable to generate certificate. Ensure evaluations or tasks exist for this intern.');
    } finally {
      setDownloadingCert(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'COMPLETED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  // Calculate timeline progress percentage
  const calculateTimelineProgress = (start, end) => {
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    const now = Date.now();
    if (now <= startDate) return 0;
    if (now >= endDate) return 100;
    return Math.round(((now - startDate) / (endDate - startDate)) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 glass-card rounded-2xl p-6 sm:p-8 bg-slate-900 border border-slate-700 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {cohort && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {cohort.department}
                  </span>
                )}
                {cohort && (
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(cohort.status)}`}>
                    {cohort.status}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {cohort ? cohort.title : 'Cohort Details'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Loading complete cohort data...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        ) : cohort && (
          <div className="space-y-6">
            {/* Description & Objectives */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Objectives & Scope
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {cohort.description || 'No detailed description provided for this cohort.'}
              </p>
            </div>

            {/* Timeline & Progress Bar */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Cohort Timeline
                </span>
                <span className="text-slate-300 font-medium">
                  {new Date(cohort.startDate).toLocaleDateString()} — {new Date(cohort.endDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Programme Progress</span>
                  <span className="font-bold text-indigo-400">
                    {calculateTimelineProgress(cohort.startDate, cohort.endDate)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${calculateTimelineProgress(cohort.startDate, cohort.endDate)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Mentor and Intern Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mentor Card */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Assigned Mentor
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Supervisor
                  </span>
                </div>
                {cohort.mentor ? (
                  <div>
                    <h5 className="text-sm font-bold text-white">
                      {cohort.mentor.firstName} {cohort.mentor.lastName}
                    </h5>
                    <p className="text-xs text-slate-400">{cohort.mentor.email}</p>
                    {cohort.mentor.phone && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{cohort.mentor.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No mentor assigned yet.</p>
                )}
              </div>

              {/* Intern Card */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> Enrolled Intern
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Student
                  </span>
                </div>
                {cohort.intern ? (
                  <div>
                    <h5 className="text-sm font-bold text-white">
                      {cohort.intern.firstName} {cohort.intern.lastName}
                    </h5>
                    <p className="text-xs text-slate-400">{cohort.intern.email}</p>
                    {cohort.intern.phone && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{cohort.intern.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No intern enrolled yet.</p>
                )}
              </div>
            </div>

            {/* Tasks Summary */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  Assigned Deliverables ({cohort.tasks?.length || 0})
                </h4>
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigateToTasks) onNavigateToTasks(cohort.id);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Open in Kanban Board</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {cohort.tasks && cohort.tasks.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {cohort.tasks.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-200">{t.title}</p>
                        <p className="text-[10px] text-slate-400">
                          Due: {new Date(t.deadline).toLocaleDateString()} • Priority: {t.priority}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {t.status}
                      </span>
                    </div>
                  ))}
                  {cohort.tasks.length > 5 && (
                    <p className="text-center text-[11px] text-slate-400 pt-1">
                      + {cohort.tasks.length - 5} more tasks
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-2">
                  No deliverables allocated to this cohort yet. Use the Tasks board to create tasks with deadlines.
                </p>
              )}
            </div>

            {/* Admin/Mentor Controls: Status Change */}
            {(user.role === 'INSTITUTION_ADMIN' || user.role === 'MENTOR') && (
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-200">Cohort Lifecycle State</span>
                  <p className="text-[11px] text-slate-400">Update cohort progress state in the institution registry</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={cohort.status}
                    disabled={updatingStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="glass-input px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-700 font-semibold cursor-pointer"
                  >
                    <option value="PENDING">PENDING (Upcoming)</option>
                    <option value="ACTIVE">ACTIVE (In Progress)</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              {cohort.intern ? (
                <button
                  onClick={() => handleDownloadCertificate(cohort.intern.id)}
                  disabled={downloadingCert}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{downloadingCert ? 'Generating PDF...' : 'Download Performance PDF'}</span>
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateToTasks) onNavigateToTasks(cohort.id);
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-glow cursor-pointer transition-all"
                >
                  <span>Go to Kanban Board</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}