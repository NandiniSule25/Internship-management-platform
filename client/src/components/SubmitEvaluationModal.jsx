import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Award, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SubmitEvaluationModal({ isOpen, onClose, onEvaluated, defaultCohortId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cohorts, setCohorts] = useState([]);

  const [form, setForm] = useState({
    internshipId: defaultCohortId || '',
    technicalScore: 9,
    communicationScore: 8,
    punctualityScore: 10,
    recommendation: 'Strongly Recommended for Full-Time Offer',
    feedback: '',
  });

  useEffect(() => {
    if (isOpen) {
      async function loadCohorts() {
        try {
          const res = await axios.get('/api/internships');
          if (res.data?.internships) {
            setCohorts(res.data.internships);
            if (!form.internshipId && res.data.internships.length > 0) {
              setForm((prev) => ({ ...prev, internshipId: res.data.internships[0].id }));
            }
          }
        } catch (err) {
          console.error('Failed to load cohorts for evaluation:', err);
        }
      }
      loadCohorts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const calculatedOverall = Number(
    ((parseInt(form.technicalScore, 10) + parseInt(form.communicationScore, 10) + parseInt(form.punctualityScore, 10)) / 3).toFixed(1)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/api/evaluations', form);
      if (res.data?.status === 'success') {
        onEvaluated(res.data.evaluation);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit evaluation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-xl glass-card rounded-2xl p-6 sm:p-8 bg-slate-900 border border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Submit Intern Milestone Evaluation</h2>
              <p className="text-xs text-slate-400">Formal performance scorecard and qualitative feedback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Internship Cohort & Student</label>
            <select
              name="internshipId"
              required
              value={form.internshipId}
              onChange={handleChange}
              className="glass-input w-full px-3 py-2 rounded-lg text-xs bg-slate-900"
            >
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} — {c.intern ? `Intern: ${c.intern.firstName} ${c.intern.lastName}` : '(No intern)'}
                </option>
              ))}
            </select>
          </div>

          {/* Scoring Sliders */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-4">
            {/* Technical Score */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-indigo-300">Technical Capability & Problem Solving</span>
                <span className="font-bold text-white bg-indigo-600/30 px-2 py-0.5 rounded border border-indigo-500/30">
                  {form.technicalScore} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                name="technicalScore"
                value={form.technicalScore}
                onChange={handleChange}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Communication Score */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-300">Communication, Collaboration & Teamwork</span>
                <span className="font-bold text-white bg-emerald-600/30 px-2 py-0.5 rounded border border-emerald-500/30">
                  {form.communicationScore} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                name="communicationScore"
                value={form.communicationScore}
                onChange={handleChange}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Punctuality Score */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-amber-300">Punctuality, Sprint Velocity & Dedication</span>
                <span className="font-bold text-white bg-amber-600/30 px-2 py-0.5 rounded border border-amber-500/30">
                  {form.punctualityScore} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                name="punctualityScore"
                value={form.punctualityScore}
                onChange={handleChange}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Computed Average Pill */}
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Calculated Milestone Rating:</span>
              <span className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-400">
                ⭐ {calculatedOverall} / 10
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Hire / Placement Recommendation</label>
            <select
              name="recommendation"
              value={form.recommendation}
              onChange={handleChange}
              className="glass-input w-full px-3 py-2 rounded-lg text-xs bg-slate-900"
            >
              <option value="Strongly Recommended for Full-Time Offer">Strongly Recommended for Full-Time Offer</option>
              <option value="Recommended for Advanced Cohort Placement">Recommended for Advanced Cohort Placement</option>
              <option value="Satisfactory Milestone Completion">Satisfactory Milestone Completion</option>
              <option value="Conditional Recommendation (Needs Skill Refinement)">Conditional Recommendation (Needs Skill Refinement)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Qualitative Feedback</label>
            <textarea
              name="feedback"
              required
              rows="3"
              value={form.feedback}
              onChange={handleChange}
              placeholder="Highlight strengths, architecture patterns applied, milestone velocity, and key areas for continued growth..."
              className="glass-input w-full px-3 py-2 rounded-lg text-xs"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-glow cursor-pointer transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Record Evaluation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
