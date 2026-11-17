import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CreateTaskModal from '../components/CreateTaskModal';
import LogProgressModal from '../components/LogProgressModal';
import {
  CheckSquare,
  Clock,
  Calendar,
  AlertTriangle,
  Plus,
  Filter,
  CheckCircle2,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  User,
  Briefcase,
  X,
  History,
  Paperclip,
  Download,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  FileCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';

export default function TaskBoard({ initialCohortId = 'ALL' }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cohortFilter, setCohortFilter] = useState(initialCohortId || 'ALL');
  const [studentFilter, setStudentFilter] = useState('ALL');
  const [cohorts, setCohorts] = useState([]);

  useEffect(() => {
    if (initialCohortId) {
      setCohortFilter(initialCohortId);
    }
  }, [initialCohortId]);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTaskForProgress, setSelectedTaskForProgress] = useState(null);
  const [selectedTaskForTimeline, setSelectedTaskForTimeline] = useState(null);

  const fetchTasksAndCohorts = async () => {
    try {
      setLoading(true);
      const [tasksRes, cohortsRes] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/internships'),
      ]);
      if (tasksRes.data?.tasks) setTasks(tasksRes.data.tasks);
      if (cohortsRes.data?.internships) setCohorts(cohortsRes.data.internships);
    } catch (err) {
      console.error('Failed to load task board:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndCohorts();
  }, []);

  const handleStatusChange = async (taskId, newStatus, reviewNote = '') => {
    try {
      await axios.patch(`/api/tasks/${taskId}/status`, { status: newStatus, reviewNote });
      await fetchTasksAndCohorts();
      if (selectedTaskForTimeline?.id === taskId) {
        setSelectedTaskForTimeline((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const uniqueStudents = Array.from(
    new Map(
      [
        ...cohorts.map((c) => c.intern).filter(Boolean),
        ...tasks.map((t) => t.assignee).filter(Boolean),
      ].map((u) => [u.id, u])
    ).values()
  );

  const filteredTasks = tasks.filter((t) => {
    if (cohortFilter !== 'ALL' && t.internshipId !== cohortFilter) return false;
    if (studentFilter !== 'ALL' && t.assigneeId !== studentFilter) return false;
    return true;
  });

  // Calculate dynamic progress bar stats
  const totalCount = filteredTasks.length;
  const completedCount = filteredTasks.filter((t) => t.status === 'COMPLETED').length;
  const underReviewCount = filteredTasks.filter((t) => t.status === 'UNDER_REVIEW').length;
  const inProgressCount = filteredTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const todoCount = filteredTasks.filter((t) => t.status === 'TODO').length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const underReviewPct = totalCount > 0 ? Math.round((underReviewCount / totalCount) * 100) : 0;
  const inProgressPct = totalCount > 0 ? Math.round((inProgressCount / totalCount) * 100) : 0;

  const currentCohort = cohorts.find((c) => c.id === cohortFilter);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'LOW':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const getDeadlineInfo = (deadlineStr) => {
    const due = new Date(deadlineStr);
    const now = new Date();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}d overdue`, class: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
    }
    if (diffDays === 0) {
      return { text: 'Due today', class: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    }
    if (diffDays <= 3) {
      return { text: `${diffDays}d left`, class: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
    }
    return { text: `${diffDays}d left`, class: 'text-slate-400 bg-slate-800 border-slate-700' };
  };

  const columns = [
    { id: 'TODO', label: 'To Do', color: 'border-t-violet-500', glow: 'shadow-glow-purple', countClass: 'bg-violet-500/20 text-violet-300' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-t-amber-500', glow: 'shadow-glow-amber', countClass: 'bg-amber-500/20 text-amber-300' },
    { id: 'UNDER_REVIEW', label: 'Under Review', color: 'border-t-cyan-500', glow: 'shadow-glow', countClass: 'bg-cyan-500/20 text-cyan-300' },
    { id: 'COMPLETED', label: 'Completed', color: 'border-t-emerald-500', glow: 'shadow-glow-emerald', countClass: 'bg-emerald-500/20 text-emerald-300' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Interactive Kanban Workflow
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-mono">
              {filteredTasks.length} Allocated Tasks
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CheckSquare className="w-7 h-7 text-indigo-400" />
            <span>Task Allocation & Progress Tracker</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sprint deliverables, real-time status transitions, proof verification, and dynamic milestone tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Cohort filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value)}
              className="glass-input text-xs px-3 py-1.5 rounded-xl bg-slate-900 cursor-pointer"
            >
              <option value="ALL">All Internship Cohorts</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Student filter for Mentors and Admins */}
          {(user.role === 'MENTOR' || user.role === 'INSTITUTION_ADMIN') && uniqueStudents.length > 0 && (
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
                className="glass-input text-xs px-3 py-1.5 rounded-xl bg-slate-900 cursor-pointer"
              >
                <option value="ALL">All Students ({uniqueStudents.length})</option>
                {uniqueStudents.map((st) => (
                  <option key={st.id} value={st.id}>
                    👤 {st.firstName} {st.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Allocate Task button for Mentors / Admins */}
          {(user.role === 'MENTOR' || user.role === 'INSTITUTION_ADMIN') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-glow cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Allocate Task</span>
            </button>
          )}
        </div>
      </div>

      {/* DYNAMIC INTERN MILESTONE PROGRESS BAR (Increases on Approved Work, Decreases if Changes Requested) */}
      <div className="p-5 rounded-2xl glass-card bg-slate-900/80 border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Intern Deliverable Progress Bar
              </span>
              {currentCohort && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                  {currentCohort.title}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {user.role === 'MENTOR'
                ? "Verify intern work proofs below. Approving tasks increases the intern's progress bar; requesting revisions decreases it."
                : user.role === 'INTERN'
                ? 'Submit daily deliverables with proof (files & links). Once your mentor approves your work, your progress bar increases!'
                : 'Real-time completion percentage based on verified, completed deliverables.'}
            </p>
          </div>

          <div className="flex items-baseline gap-1.5 sm:self-center">
            <span className="text-3xl font-extrabold text-white tracking-tight">{progressPercentage}%</span>
            <span className="text-xs font-semibold text-slate-400">Completed</span>
          </div>
        </div>

        {/* Multi-Segment Dynamic Progress Track */}
        <div className="space-y-2">
          <div className="w-full h-3.5 rounded-full bg-slate-800 p-0.5 flex overflow-hidden border border-slate-700/60">
            {/* Completed (Green) */}
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full transition-all duration-500 shadow-glow-emerald"
              style={{ width: `${progressPercentage}%` }}
              title={`Completed: ${progressPercentage}%`}
            ></div>
            {/* Under Review (Cyan/Blue) */}
            <div
              className="h-full bg-cyan-400/80 transition-all duration-500"
              style={{ width: `${underReviewPct}%` }}
              title={`Under Review: ${underReviewPct}%`}
            ></div>
            {/* In Progress (Amber) */}
            <div
              className="h-full bg-amber-400/70 transition-all duration-500"
              style={{ width: `${inProgressPct}%` }}
              title={`In Progress: ${inProgressPct}%`}
            ></div>
          </div>

          {/* Breakdown Counters */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <strong className="text-white">{completedCount}</strong> of {totalCount} Completed
              </span>

              <span className={`flex items-center gap-1.5 ${underReviewCount > 0 ? 'text-cyan-300 font-semibold' : 'text-slate-400'}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <strong>{underReviewCount}</strong> Awaiting Review
                {underReviewCount > 0 && user.role === 'MENTOR' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/30">
                    Needs Action
                  </span>
                )}
              </span>

              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <strong>{inProgressCount}</strong> In Progress
              </span>

              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400"></span>
                <strong>{todoCount}</strong> To Do
              </span>
            </div>

            {totalCount > 0 && (
              <span className="text-[11px] text-slate-400 font-mono">
                {totalCount - completedCount} tasks remaining
              </span>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">Loading task board...</p>
        </div>
      ) : (
        /* 4-Column Kanban Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {columns.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className={`glass-card rounded-2xl p-4 bg-slate-900/60 border border-slate-800 border-t-4 ${col.color} space-y-4 min-h-[500px] flex flex-col`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    {col.label}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${col.countClass}`}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Task Cards */}
                <div className="space-y-3 flex-1">
                  {columnTasks.map((task) => {
                    const deadlineInfo = getDeadlineInfo(task.deadline);
                    const isUnderReview = task.status === 'UNDER_REVIEW';
                    const isCompleted = task.status === 'COMPLETED';
                    const latestUpdate = task.progressUpdates?.[0];
                    const hasProof = Boolean(latestUpdate?.workUrl);

                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-xl transition-all space-y-3 glass-card-hover group relative ${
                          isUnderReview
                            ? 'bg-slate-800/90 border-2 border-cyan-500/60 shadow-glow'
                            : isCompleted
                            ? 'bg-slate-900/80 border border-emerald-500/30'
                            : 'bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/60'
                        }`}
                      >
                        {/* Under Review Notice Banner */}
                        {isUnderReview && (
                          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-[11px] text-cyan-300 flex items-center justify-between gap-1">
                            <span className="font-semibold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                              {user.role === 'MENTOR' ? 'Proof submitted for review!' : 'Submitted to mentor'}
                            </span>
                            <button
                              onClick={() => setSelectedTaskForTimeline(task)}
                              className="text-cyan-400 hover:underline font-bold text-[10px] cursor-pointer"
                            >
                              View Proof →
                            </button>
                          </div>
                        )}

                        {/* Priority, Proof Badge, and Deadline */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getPriorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                            {hasProof && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                                <Paperclip className="w-2.5 h-2.5" />
                                <span>Proof</span>
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${deadlineInfo.class}`}>
                            <Clock className="w-3 h-3" />
                            <span>{deadlineInfo.text}</span>
                          </span>
                        </div>

                        {/* Title and Description */}
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Cohort tag */}
                        <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="truncate">{task.internship?.title}</span>
                        </div>

                        {/* Assignee Intern & Progress Logs count */}
                        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <div className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 text-[10px] font-bold flex items-center justify-center">
                              {task.assignee?.firstName?.[0] || 'I'}
                            </div>
                            <span className="text-[11px] font-medium">{task.assignee?.firstName} {task.assignee?.lastName}</span>
                          </div>

                          <button
                            onClick={() => setSelectedTaskForTimeline(task)}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
                            title="View Proof & History"
                          >
                            <History className="w-3 h-3" />
                            <span>{task._count?.progressUpdates || 0} updates</span>
                          </button>
                        </div>

                        {/* Action buttons on card */}
                        <div className="pt-2 border-t border-slate-700/60 space-y-2">
                          {/* Quick Mentor Decision Controls on Review tasks */}
                          {(user.role === 'MENTOR' || user.role === 'INSTITUTION_ADMIN') && isUnderReview && (
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                onClick={() => handleStatusChange(task.id, 'COMPLETED', 'Proof approved by mentor. Deliverable accepted.')}
                                className="py-1 px-2 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1 cursor-pointer shadow-glow-emerald transition-all"
                                title="Approve and increase progress bar"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve (100%)</span>
                              </button>
                              <button
                                onClick={() => handleStatusChange(task.id, 'IN_PROGRESS', 'Revisions requested by mentor. Please check requirements and re-upload.')}
                                className="py-1 px-2 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                title="Send back for revisions"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Request Edit</span>
                              </button>
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2">
                            {/* Submit Work / Log Progress button (Intern or Mentor) */}
                            <button
                              onClick={() => setSelectedTaskForProgress(task)}
                              className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                            >
                              <TrendingUp className="w-3 h-3" />
                              <span>{user.role === 'INTERN' ? 'Submit Work & Proof' : 'Log Work'}</span>
                            </button>

                            {/* Status dropdown */}
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              className="glass-input text-[11px] px-2 py-1.5 rounded-lg bg-slate-900 cursor-pointer font-medium"
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="UNDER_REVIEW">Under Review</option>
                              <option value="COMPLETED">Completed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <div className="py-10 text-center text-slate-500 text-xs italic">
                      No tasks in this lane
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Side Timeline & Proof Review Drawer */}
      {selectedTaskForTimeline && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg h-full glass-card bg-slate-900 border-l border-slate-700 p-6 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Deliverable Proof & Timeline</h3>
                  <p className="text-[11px] text-slate-400">Review submitted work files, links, and status changes</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTaskForTimeline(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1 text-xs">
              <h4 className="text-sm font-bold text-white">{selectedTaskForTimeline.title}</h4>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Intern: {selectedTaskForTimeline.assignee?.firstName} {selectedTaskForTimeline.assignee?.lastName}</span>
                <span className="font-semibold text-indigo-300">Status: {selectedTaskForTimeline.status}</span>
              </div>
            </div>

            {/* Fetch and display task updates with proof files & links */}
            <TaskProgressTimeline
              taskId={selectedTaskForTimeline.id}
              taskStatus={selectedTaskForTimeline.status}
              userRole={user.role}
              onStatusUpdate={(newStatus, reviewNote) => handleStatusChange(selectedTaskForTimeline.id, newStatus, reviewNote)}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => fetchTasksAndCohorts()}
      />

      <LogProgressModal
        isOpen={!!selectedTaskForProgress}
        task={selectedTaskForProgress}
        onClose={() => setSelectedTaskForProgress(null)}
        onLogged={() => fetchTasksAndCohorts()}
      />
    </div>
  );
}

// Inner helper component to render historical progress updates and parse proof files
function TaskProgressTimeline({ taskId, taskStatus, userRole, onStatusUpdate }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);

  useEffect(() => {
    async function loadTimeline() {
      try {
        const res = await axios.get(`/api/tasks/${taskId}`);
        if (res.data?.task?.progressUpdates) {
          setUpdates(res.data.task.progressUpdates);
        }
      } catch (err) {
        console.error('Failed to load timeline:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTimeline();
  }, [taskId]);

  const parseProof = (rawUrl) => {
    if (!rawUrl) return null;
    try {
      if (rawUrl.trim().startsWith('{')) {
        const parsed = JSON.parse(rawUrl);
        return {
          link: parsed.link || null,
          fileUrl: parsed.fileUrl || null,
          fileName: parsed.fileName || 'Proof_Document',
          fileSize: parsed.fileSize || null,
        };
      }
    } catch {
      // Not JSON, continue to fallback checks
    }

    if (rawUrl.startsWith('data:')) {
      return {
        link: null,
        fileUrl: rawUrl,
        fileName: 'Attached_Proof_File',
        fileSize: null,
      };
    }

    return {
      link: rawUrl,
      fileUrl: null,
      fileName: null,
      fileSize: null,
    };
  };

  const handleDownloadFile = (dataUrl, fileName) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName || 'Internship_Proof_Deliverable';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDecision = async (newStatus) => {
    setSubmittingDecision(true);
    await onStatusUpdate(newStatus, reviewComment || (newStatus === 'COMPLETED' ? 'Approved by mentor' : 'Changes requested'));
    setReviewComment('');
    // reload updates
    try {
      const res = await axios.get(`/api/tasks/${taskId}`);
      if (res.data?.task?.progressUpdates) setUpdates(res.data.task.progressUpdates);
    } catch (e) {
      console.error(e);
    }
    setSubmittingDecision(false);
  };

  if (loading) {
    return <div className="text-xs text-slate-400 py-6 text-center">Loading progress & proof history...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Mentor Decision Box if task is in Review or In Progress */}
      {(userRole === 'MENTOR' || userRole === 'INSTITUTION_ADMIN') && (
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Mentor Proof Verification Decision
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 font-mono">
              Status: {taskStatus}
            </span>
          </div>

          <textarea
            rows="2"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Add mentor feedback or instructions for intern (optional)..."
            className="glass-input w-full px-3 py-1.5 rounded-lg text-xs"
          ></textarea>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleDecision('COMPLETED')}
              disabled={submittingDecision || taskStatus === 'COMPLETED'}
              className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-glow-emerald cursor-pointer transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve & Complete</span>
            </button>

            <button
              onClick={() => handleDecision('IN_PROGRESS')}
              disabled={submittingDecision || taskStatus === 'IN_PROGRESS'}
              className="px-3 py-2 rounded-xl text-xs font-bold text-amber-300 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 cursor-pointer transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Request Revisions</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 italic">
            * Approving updates the task to Completed and increases the progress bar. Requesting revisions moves it to In Progress and decreases the progress bar.
          </p>
        </div>
      )}

      {updates.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs space-y-1">
          <TrendingUp className="w-6 h-6 mx-auto text-slate-600 mb-2" />
          <p>No progress updates logged yet for this task.</p>
          <p className="text-slate-500">The intern can use the "Submit Work & Proof" button to upload deliverables.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Work Submission Logs ({updates.length})
          </h5>
          {updates.map((up) => {
            const proof = parseProof(up.workUrl);
            const isImage = proof?.fileUrl?.startsWith('data:image/');

            return (
              <div key={up.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-300">
                    {up.intern?.firstName} {up.intern?.lastName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(up.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{up.updateNote}</p>

                {/* Proof Section: Links and Uploaded File */}
                {proof && (proof.link || proof.fileUrl) && (
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" /> Verified Work Proof
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {proof.link && (
                        <a
                          href={proof.link}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium cursor-pointer transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Deliverable URL</span>
                        </a>
                      )}

                      {proof.fileUrl && (
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(proof.fileUrl, proof.fileName)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium cursor-pointer transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download {proof.fileName || 'Proof Document'} {proof.fileSize ? `(${proof.fileSize})` : ''}</span>
                        </button>
                      )}
                    </div>

                    {/* Inline Image Preview */}
                    {isImage && (
                      <div className="pt-2">
                        <img
                          src={proof.fileUrl}
                          alt={proof.fileName || 'Proof Preview'}
                          className="max-h-48 rounded-lg border border-slate-700 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => handleDownloadFile(proof.fileUrl, proof.fileName)}
                          title="Click to download image"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-700/40 text-[11px] text-slate-400">
                  {up.hoursSpent ? (
                    <span className="text-amber-400 flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" /> {up.hoursSpent} hrs logged
                    </span>
                  ) : (
                    <span></span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                    Status: {up.statusAtUpdate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}