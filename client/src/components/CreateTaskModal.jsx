import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckSquare, Calendar, AlertCircle, Flag, Users } from 'lucide-react';

export default function CreateTaskModal({ isOpen, onClose, onCreated, defaultCohortId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cohorts, setCohorts] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    internshipId: defaultCohortId || '',
  });

  useEffect(() => {
    if (isOpen) {
      async function loadCohorts() {
        try {
          const res = await axios.get('/api/internships?status=ACTIVE');
          if (res.data?.internships) {
            setCohorts(res.data.internships);
            if (!form.internshipId && res.data.internships.length > 0) {
              setForm((prev) => ({ ...prev, internshipId: res.data.internships[0].id }));
            }
          }
        } catch (err) {
          console.error('Failed to load cohorts for task:', err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post('/api/tasks', form);
      if (res.data?.status === 'success') {
        onCreated(res.data.task);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to allocate task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg glass-card rounded-2xl p-6 sm:p-8 bg-slate-900 border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Allocate Task with Deadline</h2>
              <p className="text-xs text-slate-400">Assign project deliverable to the enrolled intern</p>
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title</label>
            <input
              type="text"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Implement OAuth Flow & State Token Validation"
              className="glass-input w-full px-3 py-2 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Internship Cohort</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority Level</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="glass-input w-full px-3 py-2 rounded-lg text-xs bg-slate-900"
              >
                <option value="LOW">🟢 LOW Priority</option>
                <option value="MEDIUM">🟡 MEDIUM Priority</option>
                <option value="HIGH">🟠 HIGH Priority</option>
                <option value="URGENT">🔴 URGENT Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Due Deadline</label>
              <input
                type="date"
                name="deadline"
                required
                value={form.deadline}
                onChange={handleChange}
                className="glass-input w-full px-3 py-2 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Requirements & Acceptance Criteria</label>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              placeholder="Outline steps, acceptance criteria, branch naming, and deliverables..."
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-glow cursor-pointer transition-all disabled:opacity-50"
            >
              {loading ? 'Assigning Task...' : 'Allocate Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
