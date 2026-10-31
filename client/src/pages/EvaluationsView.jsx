import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SubmitEvaluationModal from '../components/SubmitEvaluationModal';
import {
  Award,
  Star,
  FileDown,
  Plus,
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function EvaluationsView() {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/evaluations');
      if (res.data?.evaluations) {
        setEvaluations(res.data.evaluations);
      }
    } catch (err) {
      console.error('Failed to load evaluations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const handleDownloadPdf = async (internshipId, cohortTitle) => {
    try {
      setDownloadingId(internshipId);
      const res = await axios.get(`/api/reports/intern/${internshipId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Performance_Report_${cohortTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download PDF report. Ensure the cohort has been evaluated.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
              Performance & Certification Center
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 font-mono">
              {evaluations.length} Milestone Scorecards
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Award className="w-7 h-7 text-pink-400" />
            <span>Mentor Evaluations & Verified PDF Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Formal faculty grading, multi-attribute performance ratings, and cryptographic PDF certificate issuance.
          </p>
        </div>

        {/* Action button for Mentors / Admins */}
        {(user.role === 'MENTOR' || user.role === 'INSTITUTION_ADMIN') && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-glow cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Submit New Evaluation</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">Loading performance evaluations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {evaluations.map((ev) => (
            <div
              key={ev.id}
              className="glass-card p-6 rounded-2xl border-slate-800 bg-slate-900/60 glass-card-hover flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Cohort & Student info */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {ev.internship?.department || 'Department'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(ev.evaluatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{ev.internship?.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>Intern:</span> <strong className="text-white">{ev.intern?.firstName} {ev.intern?.lastName}</strong>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mentor:</span> <strong className="text-white">{ev.mentor?.firstName} {ev.mentor?.lastName}</strong>
                    </span>
                  </div>
                </div>

                {/* Scorecard Visual Meter Grid */}
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase">Technical</span>
                    <p className="text-xl font-extrabold text-white">{ev.technicalScore} <span className="text-xs text-slate-400">/ 10</span></p>
                  </div>
                  <div className="space-y-1 border-x border-slate-700">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase">Communication</span>
                    <p className="text-xl font-extrabold text-white">{ev.communicationScore} <span className="text-xs text-slate-400">/ 10</span></p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-amber-300 uppercase">Punctuality</span>
                    <p className="text-xl font-extrabold text-white">{ev.punctualityScore} <span className="text-xs text-slate-400">/ 10</span></p>
                  </div>
                </div>

                {/* Overall Score & Recommendation Banner */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-indigo-950/40 border border-pink-500/30">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-pink-400">Overall Rating</span>
                    <p className="text-xl font-black text-white">⭐ {ev.overallScore} / 10</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-400 block">Placement Recommendation</span>
                    <span className="text-xs font-bold text-emerald-300">{ev.recommendation}</span>
                  </div>
                </div>

                {/* Qualitative Feedback */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Mentor Feedback & Remarks</h4>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 italic">
                    "{ev.feedback}"
                  </p>
                </div>
              </div>

              {/* Download PDF Certificate button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Official Deliverable:</span>
                <button
                  disabled={downloadingId === ev.internshipId}
                  onClick={() => handleDownloadPdf(ev.internshipId, ev.internship?.title || 'Report')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-glow cursor-pointer transition-all disabled:opacity-50"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{downloadingId === ev.internshipId ? 'Generating PDF...' : 'Download PDF Report'}</span>
                </button>
              </div>
            </div>
          ))}

          {evaluations.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 space-y-2">
              <Award className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">No milestone evaluations recorded yet.</p>
              <p className="text-xs text-slate-500">Mentors can submit evaluations once deliverables are submitted.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <SubmitEvaluationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onEvaluated={() => fetchEvaluations()}
      />
    </div>
  );
}
