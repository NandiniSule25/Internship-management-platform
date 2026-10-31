import React, { useState } from 'react';
import axios from 'axios';
import { X, TrendingUp, Link as LinkIcon, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LogProgressModal({ isOpen, onClose, task, onLogged }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    updateNote: '',
    workUrl: '',
    hoursSpent: '2.5',
    statusAtUpdate: task?.status || 'IN_PROGRESS',
  });

  if (!isOpen || !task) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`/api/tasks/${task.id}/progress`, form);
      if (res.data?.status === 'success') {
        onLogged(res.data.progressUpdate, res.data.currentTaskStatus);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to log progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg glass-card rounded-2xl p-6 sm:p-8 bg-slate-900 border border-slate-700 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Log Work & Daily Progress</h2>
              <p className="text-xs text-slate-400 line-clamp-1">Task: {task.title}</p>
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">Work Accomplished Note</label>
            <textarea
              name="updateNote"
              required
              rows="3"
              value={form.updateNote}
              onChange={handleChange}
              placeholder="Detail what was built, bugs fixed, design patterns applied, or tests added..."
              className="glass-input w-full px-3 py-2 rounded-lg text-xs"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hours Logged</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  name="hoursSpent"
                  required
                  value={form.hoursSpent}
                  onChange={handleChange}
                  className="glass-input w-full pl-9 pr-3 py-2 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Task Status</label>
              <select
                name="statusAtUpdate"
                value={form.statusAtUpdate}
                onChange={handleChange}
                className="glass-input w-full px-3 py-2 rounded-lg text-xs bg-slate-900"
              >
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="UNDER_REVIEW">UNDER REVIEW (Ready for Mentor)</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Deliverable URL (GitHub PR / Doc / Demo)
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="url"
                name="workUrl"
                value={form.workUrl}
                onChange={handleChange}
                placeholder="https://github.com/org/repo/pull/4"
                className="glass-input w-full pl-9 pr-3 py-2 rounded-lg text-xs"
              />
            </div>
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-glow-amber cursor-pointer transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting Log...' : 'Submit Progress Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
