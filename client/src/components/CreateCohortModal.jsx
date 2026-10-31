import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Briefcase, Calendar, Users, Building, AlertCircle } from 'lucide-react';

export default function CreateCohortModal({ isOpen, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [interns, setInterns] = useState([]);

  const [form, setForm] = useState({
    title: '',
    department: 'Computer Science',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'ACTIVE',
    mentorId: '',
    internId: '',
  });

  useEffect(() => {
    if (isOpen) {
      async function loadInstitutionUsers() {
        try {
          const [mentorsRes, internsRes] = await Promise.all([
            axios.get('/api/institutions/me/users?role=MENTOR'),
            axios.get('/api/institutions/me/users?role=INTERN'),
          ]);
          if (mentorsRes.data?.users) {
            setMentors(mentorsRes.data.users);
            if (mentorsRes.data.users.length > 0) {
              setForm((prev) => ({ ...prev, mentorId: mentorsRes.data.users[0].id }));
            }
          }
          if (internsRes.data?.users) {
            setInterns(internsRes.data.users);
            if (internsRes.data.users.length > 0) {
              setForm((prev) => ({ ...prev, internId: internsRes.data.users[0].id }));
            }
          }
        } catch (err) {
          console.error('Failed to load mentors/interns:', err);
        }
      }
      loadInstitutionUsers();
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
      const res = await axios.post('/api/internships', form);
      if (res.data?.status === 'success') {
        onCreated(res.data.internship);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create cohort');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl glass-card rounded-2xl p-6 sm:p-8 bg-slate-900 border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create Internship Cohort</h2>
              <p className="text-xs text-slate-400">Allocate department, timeline, mentor, and student</p>
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">Cohort Title</label>
            <input
              type="text"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Cloud Native DevOps & Kubernetes"
              className="glass-input w-full px-3 py-2 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="glass-input w-full px-3 py-2 rounded-lg text-xs bg-slate-900"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Information Security">Information Security</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Data Analytics">Data Analytics</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="glass-input w-full px-3 py-2 rounded-lg text-xs bg-slate-900"
              >
                <option value="ACTIVE">ACTIVE (In Progress)</option>
                <option value="PENDING">PENDING (Upcoming)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                required
                value={form.startDate}
                onChange={handleChange}
                className="glass-input w-full px-3 py-2 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                required
                value={form.endDate}
                onChange={handleChange}
                className="glass-input w-full px-3 py-2 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Mentor Allocation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assign Mentor</label>
              <select
                name="mentorId"
                value={form.mentorId}
                onChange={handleChange}
                className="glass-input w-full px-3 py-2 rounded-lg text-xs bg-slate-900"
              >
                <option value="">-- Unassigned --</option>
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Intern Allocation */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Enroll Intern</label>
              <select
                name="internId"
                value={form.internId}
                onChange={handleChange}
                className="glass-input w-full px-3 py-2 rounded-lg text-xs bg-slate-900"
              >
                <option value="">-- Unassigned --</option>
                {interns.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.firstName} {i.lastName} ({i.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Objectives</label>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              placeholder="Outline project deliverables, expected technologies, and learning goals..."
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-glow-purple cursor-pointer transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Cohort...' : 'Save & Launch Cohort'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
