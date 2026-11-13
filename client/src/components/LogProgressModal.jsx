import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  X,
  TrendingUp,
  Link as LinkIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileCheck,
  File,
  Paperclip,
  Trash2,
  Sparkles,
} from 'lucide-react';

export default function LogProgressModal({ isOpen, onClose, task, onLogged }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    updateNote: '',
    workUrl: '',
    hoursSpent: '2.0',
    statusAtUpdate: 'UNDER_REVIEW',
  });

  const [attachedFile, setAttachedFile] = useState(null); // { name, size, dataUrl }

  useEffect(() => {
    if (task) {
      setForm({
        updateNote: '',
        workUrl: '',
        hoursSpent: '2.0',
        statusAtUpdate: task.status === 'COMPLETED' ? 'COMPLETED' : 'UNDER_REVIEW',
      });
      setAttachedFile(null);
      setError(null);
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 8MB
    if (file.size > 8 * 1024 * 1024) {
      setError('File size exceeds 8MB limit. Please upload a smaller document, image, or link.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      setAttachedFile({
        name: file.name,
        size: formattedSize,
        type: file.type,
        dataUrl: reader.result,
      });
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read file. Please try another file or use a link.');
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setAttachedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...form,
        ...(attachedFile && {
          fileUrl: attachedFile.dataUrl,
          fileName: attachedFile.name,
          fileSize: attachedFile.size,
        }),
      };

      const res = await axios.post(`/api/tasks/${task.id}/progress`, payload);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg glass-card rounded-2xl p-6 sm:p-8 bg-slate-900 border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Submit Work & Proof</h2>
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
          {/* Work description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Work Accomplished & Deliverable Summary <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="updateNote"
              required
              rows="3"
              value={form.updateNote}
              onChange={handleChange}
              placeholder="Detail what code was written, bugs resolved, components built, or experiments verified..."
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Submission Target Status</label>
              <select
                name="statusAtUpdate"
                value={form.statusAtUpdate}
                onChange={handleChange}
                className="glass-input w-full px-3 py-2 rounded-lg text-xs bg-slate-900 font-medium"
              >
                <option value="UNDER_REVIEW">⭐ Under Review (Ready for Mentor)</option>
                <option value="IN_PROGRESS">In Progress (Daily work log)</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Deliverable URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Deliverable URL (GitHub PR / Figma / Live Demo)
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="url"
                name="workUrl"
                value={form.workUrl}
                onChange={handleChange}
                placeholder="https://github.com/org/repo/pull/12"
                className="glass-input w-full pl-9 pr-3 py-2 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* File Upload Section for Proof */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                Upload Proof File (Screenshot / PDF / Code / Archive)
              </span>
              <span className="text-[10px] text-slate-500">Max 8MB</span>
            </label>

            {!attachedFile ? (
              <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer transition-all group">
                <Upload className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors mb-1.5" />
                <span className="text-xs text-slate-300 font-medium">Click to select proof file</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Supports PDF, PNG, JPG, ZIP, DOCX, TXT</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.zip,.docx,.txt,.doc"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 border border-cyan-500/30 text-xs">
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 truncate">{attachedFile.name}</p>
                    <p className="text-[10px] text-slate-400">{attachedFile.size}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Your mentor will inspect your deliverable link and proof file. Upon verification and approval, your milestone progress bar will automatically increase.
            </span>
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 shadow-glow-amber cursor-pointer transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting Proof...' : 'Submit Work & Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}