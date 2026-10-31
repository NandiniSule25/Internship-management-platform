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
} from 'lucide-react';

export default function TaskBoard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cohortFilter, setCohortFilter] = useState('ALL');
  const [cohorts, setCohorts] = useState([]);

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

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      await fetchTasksAndCohorts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (cohortFilter === 'ALL') return true;
    return t.internshipId === cohortFilter;
  });

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
            Sprint deliverables, real-time status transitions, daily work notes, and submission review pipelines.
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
                    return (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/60 transition-all space-y-3 glass-card-hover group"
                      >
                        {/* Priority and Deadline Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
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
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                            title="View Progress History"
                          >
                            <History className="w-3 h-3" />
                            <span>{task._count?.progressUpdates || 0} updates</span>
                          </button>
                        </div>

                        {/* Action buttons on card */}
                        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
                          {/* Log Progress button (Intern or Mentor) */}
                          <button
                            onClick={() => setSelectedTaskForProgress(task)}
                            className="flex-1 py-1 px-2 rounded-lg text-[11px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <TrendingUp className="w-3 h-3" />
                            <span>Log Work</span>
                          </button>

                          {/* Quick status transition dropdown */}
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className="glass-input text-[11px] px-2 py-1 rounded-lg bg-slate-900 cursor-pointer"
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="UNDER_REVIEW">Review</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
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

      {/* Side Timeline Drawer for Task Progress Updates */}
      {selectedTaskForTimeline && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md h-full glass-card bg-slate-900 border-l border-slate-700 p-6 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Work Progress Timeline</h3>
              </div>
              <button
                onClick={() => setSelectedTaskForTimeline(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">{selectedTaskForTimeline.title}</h4>
              <p className="text-xs text-slate-400 mt-1">
                Intern: {selectedTaskForTimeline.assignee?.firstName} {selectedTaskForTimeline.assignee?.lastName}
              </p>
            </div>

            {/* Fetch task updates */}
            <TaskProgressTimeline taskId={selectedTaskForTimeline.id} />
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

// Inner helper component to render historical progress updates
function TaskProgressTimeline({ taskId }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="text-xs text-slate-400">Loading progress history...</div>;
  }

  if (updates.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-xs space-y-1">
        <TrendingUp className="w-6 h-6 mx-auto text-slate-600 mb-2" />
        <p>No progress updates logged yet for this task.</p>
        <p className="text-slate-500">The intern can use the "Log Work" button to record updates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((up) => (
        <div key={up.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-indigo-300">
              {up.intern?.firstName} {up.intern?.lastName}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {new Date(up.createdAt).toLocaleString()}
            </span>
          </div>

          <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{up.updateNote}</p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-[11px]">
            {up.hoursSpent && (
              <span className="text-amber-400 flex items-center gap-1 font-semibold">
                <Clock className="w-3 h-3" /> {up.hoursSpent} hrs logged
              </span>
            )}
            {up.workUrl && (
              <a
                href={up.workUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Deliverable</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
