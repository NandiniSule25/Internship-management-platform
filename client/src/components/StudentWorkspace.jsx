import React, { useState } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  User,
  Users,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Star,
  FileDown,
  Plus,
  ExternalLink,
  Check,
  RotateCcw,
  Sparkles,
  Paperclip,
  FileText,
  Mail,
  Phone,
  Building2,
  ChevronDown,
} from 'lucide-react';
import CreateTaskModal from './CreateTaskModal';
import SubmitEvaluationModal from './SubmitEvaluationModal';

export default function StudentWorkspace({
  student,
  allStudents = [],
  onSelectStudent,
  onBackToList,
  onRefresh,
  userRole,
}) {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'evaluation'
  const [taskFilter, setTaskFilter] = useState('ALL');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [reviewingTaskId, setReviewingTaskId] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  if (!student) return null;

  const primaryCohort = student.primaryCohort || student.cohorts?.[0];
  const tasks = student.tasks || [];
  const evaluations = student.evaluations || [];
  const latestEvaluation = evaluations[0] || null;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'ALL') return true;
    return t.status === taskFilter;
  });

  const stats = student.stats || {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === 'COMPLETED').length,
    underReviewTasks: tasks.filter((t) => t.status === 'UNDER_REVIEW').length,
    inProgressTasks: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    todoTasks: tasks.filter((t) => t.status === 'TODO').length,
    progressPercentage:
      tasks.length > 0
        ? Math.round((tasks.filter((t) => t.status === 'COMPLETED').length / tasks.length) * 100)
        : 0,
  };

  const handleStatusChange = async (taskId, newStatus, note = '') => {
    try {
      setUpdatingTaskId(taskId);
      await axios.patch(`/api/tasks/${taskId}/status`, { status: newStatus, reviewNote: note });
      setReviewingTaskId(null);
      setReviewNote('');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (!primaryCohort) return;
    try {
      setDownloadingPdf(true);
      const res = await axios.get(`/api/reports/intern/${primaryCohort.id}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `Performance_Report_${student.firstName}_${student.lastName}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate report. Ensure an evaluation has been submitted.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'LOW':
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'UNDER_REVIEW':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 animate-pulse';
      case 'IN_PROGRESS':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'TODO':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action Bar with Back & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-card bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToList}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to All Students</span>
          </button>

          {/* Quick Switcher if more than 1 student */}
          {allStudents.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 hidden md:inline">Switch Student:</span>
              <div className="relative">
                <select
                  value={student.id}
                  onChange={(e) => onSelectStudent && onSelectStudent(e.target.value)}
                  className="glass-input pl-3 pr-8 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 border border-slate-700 cursor-pointer appearance-none"
                >
                  {allStudents.map((st) => (
                    <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                      👤 {st.firstName} {st.lastName} ({st.primaryCohort?.title?.slice(0, 24)}...)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Quick Report Download & Overall Progress */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            <span className="text-slate-400">Milestone Progress:</span>
            <strong className="text-emerald-400 font-extrabold">{stats.progressPercentage}%</strong>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf || !primaryCohort}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-glow transition-all cursor-pointer disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            <span>{downloadingPdf ? 'Exporting...' : 'PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Student Profile & Cohort Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Student Avatar & Basic Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-black shadow-glow flex-shrink-0">
              {student.firstName[0]}
              {student.lastName[0]}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {student.firstName} {student.lastName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Enrolled Intern
                </span>
                {primaryCohort?.status && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {primaryCohort.status}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  {student.email}
                </span>
                {student.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    {student.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Enrolled Cohort & Mentor Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Assigned Internship Track
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                {primaryCohort?.department || 'Engineering'}
              </span>
            </div>

            <p className="font-bold text-white text-sm line-clamp-1">
              {primaryCohort?.title || 'General Internship Track'}
            </p>

            <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {primaryCohort?.startDate
                    ? new Date(primaryCohort.startDate).toLocaleDateString()
                    : 'N/A'}{' '}
                  —{' '}
                  {primaryCohort?.endDate
                    ? new Date(primaryCohort.endDate).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>

            {primaryCohort?.mentor && (
              <div className="flex items-center gap-1.5 text-slate-300 pt-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Supervising Mentor:{' '}
                  <strong className="text-white">
                    {primaryCohort.mentor.firstName} {primaryCohort.mentor.lastName}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Multi-Segment Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Sprint Deliverables Progress for {student.firstName}</span>
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {stats.completedTasks} of {stats.totalTasks} Deliverables Approved ({stats.progressPercentage}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${stats.progressPercentage}%` }}
              title={`Completed: ${stats.progressPercentage}%`}
            ></div>
            <div
              className="h-full bg-cyan-400 transition-all duration-500"
              style={{
                width: `${
                  stats.totalTasks > 0 ? (stats.underReviewTasks / stats.totalTasks) * 100 : 0
                }%`,
              }}
              title="Under Review"
            ></div>
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{
                width: `${
                  stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0
                }%`,
              }}
              title="In Progress"
            ></div>
          </div>

          {/* Breakdown tags */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <strong>{stats.completedTasks}</strong> Completed
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <strong>{stats.underReviewTasks}</strong> Awaiting Review
            </span>
            <span className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <strong>{stats.inProgressTasks}</strong> In Progress
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              <strong>{stats.todoTasks}</strong> Pending
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Sprint Deliverables vs Milestone Evaluation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Sprint Deliverables & Tasks ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'evaluation'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Milestone Evaluation & Scorecard</span>
            {latestEvaluation && (
              <span className="ml-1 text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30">
                ⭐ {latestEvaluation.overallScore}/10
              </span>
            )}
          </button>
        </div>

        {/* Tab-specific top actions */}
        {activeTab === 'tasks' && (
          <button
            onClick={() => setShowCreateTaskModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-glow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Allocate Task to {student.firstName}</span>
          </button>
        )}

        {activeTab === 'evaluation' && (
          <button
            onClick={() => setShowEvalModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-500 shadow-glow transition-all cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>{latestEvaluation ? 'Update Evaluation' : 'Submit Evaluation'}</span>
          </button>
        )}
      </div>

      {/* Tab 1 Content: Tasks & Sprint Deliverables */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              {['ALL', 'UNDER_REVIEW', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setTaskFilter(st)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    taskFilter === st
                      ? 'bg-indigo-600 text-white shadow-glow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL'
                    ? `All Tasks (${tasks.length})`
                    : st === 'UNDER_REVIEW'
                    ? `Review Pending (${stats.underReviewTasks})`
                    : st}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </span>
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 rounded-2xl glass-card bg-slate-900/40 border border-slate-800 space-y-3">
              <CheckCircle2 className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-semibold">No tasks found for this filter.</p>
              <button
                onClick={() => setShowCreateTaskModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Allocate First Task</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map((task) => {
                const latestUpdate = task.progressUpdates?.[0];
                const isUnderReview = task.status === 'UNDER_REVIEW';
                const isCompleted = task.status === 'COMPLETED';

                return (
                  <div
                    key={task.id}
                    className={`p-5 rounded-2xl glass-card transition-all space-y-4 border ${
                      isUnderReview
                        ? 'bg-slate-900/90 border-cyan-500/60 shadow-glow'
                        : isCompleted
                        ? 'bg-slate-900/60 border-emerald-500/30'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    {/* Task Header: Priority & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority} Priority
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                            task.status
                          )}`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Due {new Date(task.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-base font-bold text-white mb-1">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Proof of Work Submission Box */}
                    {latestUpdate && (
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="font-bold flex items-center gap-1.5 text-indigo-300">
                            <Sparkles className="w-3.5 h-3.5" />
                            Proof of Work Submitted
                          </span>
                          {latestUpdate.hoursSpent && (
                            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              ⏱️ {latestUpdate.hoursSpent} hrs logged
                            </span>
                          )}
                        </div>

                        <p className="text-slate-300 italic">"{latestUpdate.updateNote}"</p>

                        {/* External URL or file proof */}
                        {latestUpdate.workUrl && (
                          <div className="pt-1">
                            {latestUpdate.workUrl.startsWith('data:') ? (
                              <a
                                href={latestUpdate.workUrl}
                                download={`Proof_${task.id.slice(0, 8)}`}
                                className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 underline font-medium"
                              >
                                <Paperclip className="w-3.5 h-3.5" />
                                <span>Download Attached Proof File</span>
                              </a>
                            ) : (
                              <a
                                href={latestUpdate.workUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 underline font-medium"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[280px]">
                                  {latestUpdate.workUrl}
                                </span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mentor Review & Verification Actions */}
                    {(userRole === 'MENTOR' || userRole === 'INSTITUTION_ADMIN') && (
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                        {isUnderReview ? (
                          <div className="w-full space-y-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                                disabled={updatingTaskId === task.id}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-glow-emerald cursor-pointer transition-all disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve & Complete</span>
                              </button>

                              <button
                                onClick={() =>
                                  setReviewingTaskId(reviewingTaskId === task.id ? null : task.id)
                                }
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 cursor-pointer transition-all"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Request Revisions</span>
                              </button>
                            </div>

                            {/* Inline Revision Feedback Box */}
                            {reviewingTaskId === task.id && (
                              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2 animate-in fade-in">
                                <label className="text-[11px] font-bold text-amber-300 block">
                                  Revision Instructions for {student.firstName}:
                                </label>
                                <textarea
                                  value={reviewNote}
                                  onChange={(e) => setReviewNote(e.target.value)}
                                  placeholder="Specify what needs improvement before approval..."
                                  rows={2}
                                  className="w-full glass-input p-2 rounded-lg text-xs"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setReviewingTaskId(null)}
                                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusChange(task.id, 'IN_PROGRESS', reviewNote)
                                    }
                                    disabled={!reviewNote.trim()}
                                    className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50"
                                  >
                                    Send Feedback & Request Changes
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : isCompleted ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Deliverable verified and approved</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStatusChange(task.id, 'UNDER_REVIEW')}
                              className="text-xs text-cyan-400 hover:underline cursor-pointer"
                            >
                              Mark as Under Review
                            </button>
                            <span className="text-slate-600">•</span>
                            <button
                              onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                              className="text-xs text-emerald-400 hover:underline cursor-pointer"
                            >
                              Fast-Track Complete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2 Content: Milestone Evaluation & Scorecard */}
      {activeTab === 'evaluation' && (
        <div className="space-y-6">
          {latestEvaluation ? (
            <div className="p-6 rounded-3xl glass-card bg-slate-900/80 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                    Official Milestone Evaluation
                  </span>
                  <h3 className="text-xl font-black text-white">
                    Evaluation Scorecard for {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Evaluated by{' '}
                    <strong className="text-slate-200">
                      {latestEvaluation.mentor?.firstName} {latestEvaluation.mentor?.lastName}
                    </strong>{' '}
                    on {new Date(latestEvaluation.evaluatedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-center">
                    <span className="text-[10px] uppercase font-bold text-pink-300 block">
                      Overall Score
                    </span>
                    <span className="text-2xl font-black text-white">
                      ⭐ {latestEvaluation.overallScore} / 10
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Core Criteria Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Technical Competency
                  </span>
                  <p className="text-3xl font-extrabold text-white">
                    {latestEvaluation.technicalScore}{' '}
                    <span className="text-xs text-slate-400 font-normal">/ 10</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Communication & Teamwork
                  </span>
                  <p className="text-3xl font-extrabold text-white">
                    {latestEvaluation.communicationScore}{' '}
                    <span className="text-xs text-slate-400 font-normal">/ 10</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Punctuality & Reliability
                  </span>
                  <p className="text-3xl font-extrabold text-white">
                    {latestEvaluation.punctualityScore}{' '}
                    <span className="text-xs text-slate-400 font-normal">/ 10</span>
                  </p>
                </div>
              </div>

              {/* Feedback & Recommendation */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Mentor Assessment & Remarks:
                  </h4>
                  <p className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-200 text-sm leading-relaxed italic">
                    "{latestEvaluation.feedback}"
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                      Placement / Career Recommendation:
                    </span>
                    <p className="text-sm font-bold text-white">
                      {latestEvaluation.recommendation || 'Satisfactory Performance'}
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download Report</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 rounded-3xl glass-card bg-slate-900/60 border border-slate-800 space-y-4">
              <Award className="w-12 h-12 mx-auto text-pink-400" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">No Evaluation Recorded Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Evaluate {student.firstName}'s technical aptitude, communication, and punctuality
                  to generate verified institutional performance certificates.
                </p>
              </div>
              <button
                onClick={() => setShowEvalModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 shadow-glow cursor-pointer transition-all"
              >
                <Award className="w-4 h-4" />
                <span>Submit Milestone Evaluation</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateTaskModal && (
        <CreateTaskModal
          isOpen={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
          defaultCohortId={primaryCohort?.id}
          onCreated={() => {
            setShowCreateTaskModal(false);
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {showEvalModal && (
        <SubmitEvaluationModal
          isOpen={showEvalModal}
          onClose={() => setShowEvalModal(false)}
          defaultCohortId={primaryCohort?.id}
          onEvaluated={() => {
            setShowEvalModal(false);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}
