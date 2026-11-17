import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export default function StudentListView({
  students = [],
  onSelectStudent,
  userRole = 'MENTOR',
  title,
  subtitle,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'REVIEW_NEEDED' | 'EVALUATED'
  const [mentorFilter, setMentorFilter] = useState('ALL'); // for Admin

  // Extract unique mentors for filter if admin
  const mentors = Array.from(
    new Set(
      students
        .map((s) => s.primaryCohort?.mentor || s.mentor)
        .filter(Boolean)
        .map((m) => JSON.stringify({ id: m.id, name: `${m.firstName} ${m.lastName}` }))
    )
  ).map((str) => JSON.parse(str));

  // Filter students
  const filteredStudents = students.filter((s) => {
    // Search match
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const email = (s.email || '').toLowerCase();
      const cohortTitle = (s.primaryCohort?.title || '').toLowerCase();
      const dept = (s.primaryCohort?.department || '').toLowerCase();
      if (
        !fullName.includes(term) &&
        !email.includes(term) &&
        !cohortTitle.includes(term) &&
        !dept.includes(term)
      ) {
        return false;
      }
    }

    // Mentor filter (admin only)
    if (mentorFilter !== 'ALL') {
      const mentorId = s.primaryCohort?.mentor?.id || s.mentor?.id;
      if (mentorId !== mentorFilter) return false;
    }

    // Status filter
    if (statusFilter === 'REVIEW_NEEDED') {
      return (s.stats?.underReviewTasks || 0) > 0;
    }
    if (statusFilter === 'EVALUATED') {
      return (s.evaluations?.length || 0) > 0;
    }
    if (statusFilter === 'ACTIVE') {
      return s.primaryCohort?.status === 'ACTIVE';
    }

    return true;
  });

  // Calculate aggregate metrics across these students
  const totalStudents = students.length;
  const totalTasksUnderReview = students.reduce(
    (acc, s) => acc + (s.stats?.underReviewTasks || 0),
    0
  );
  const totalCompletedTasks = students.reduce(
    (acc, s) => acc + (s.stats?.completedTasks || 0),
    0
  );
  const totalTasks = students.reduce((acc, s) => acc + (s.stats?.totalTasks || 0), 0);
  const avgProgress =
    totalStudents > 0
      ? Math.round(
          students.reduce((acc, s) => acc + (s.stats?.progressPercentage || 0), 0) / totalStudents
        )
      : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                {userRole === 'INSTITUTION_ADMIN' ? 'Institutional Directory' : 'Mentor Supervision'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                {totalStudents} {totalStudents === 1 ? 'Student' : 'Students'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-400" />
              <span>
                {title ||
                  (userRole === 'INSTITUTION_ADMIN'
                    ? 'Student-Centric Internship Tracker'
                    : 'Students Under My Mentorship')}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
              {subtitle ||
                (userRole === 'INSTITUTION_ADMIN'
                  ? 'Inspect individual student deliverables, verify milestone proofs, and track supervisor evaluations.'
                  : 'Select any student below to view their active sprint deliverables, review proof of work, track progress, or submit evaluations.')}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Deliverables
              </span>
              <span className="text-lg font-black text-white">
                {totalCompletedTasks} / {totalTasks}
              </span>
            </div>

            <div
              className={`p-3 rounded-2xl border text-center min-w-[110px] ${
                totalTasksUnderReview > 0
                  ? 'bg-cyan-950/40 border-cyan-500/40 shadow-glow'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <span
                className={`text-[10px] uppercase font-bold block ${
                  totalTasksUnderReview > 0 ? 'text-cyan-300' : 'text-slate-400'
                }`}
              >
                Needs Review
              </span>
              <span
                className={`text-lg font-black flex items-center justify-center gap-1.5 ${
                  totalTasksUnderReview > 0 ? 'text-cyan-300' : 'text-white'
                }`}
              >
                {totalTasksUnderReview > 0 && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                )}
                {totalTasksUnderReview}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Progress</span>
              <span className="text-lg font-black text-emerald-400">{avgProgress}%</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, email, or department..."
              className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs text-white"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Admin Mentor Filter */}
            {userRole === 'INSTITUTION_ADMIN' && mentors.length > 1 && (
              <select
                value={mentorFilter}
                onChange={(e) => setMentorFilter(e.target.value)}
                className="glass-input px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 cursor-pointer"
              >
                <option value="ALL">All Mentors ({mentors.length})</option>
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    Mentor: {m.name}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({students.length})
              </button>

              <button
                onClick={() => setStatusFilter('REVIEW_NEEDED')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === 'REVIEW_NEEDED'
                    ? 'bg-cyan-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Awaiting Review</span>
                {totalTasksUnderReview > 0 && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                )}
              </button>

              <button
                onClick={() => setStatusFilter('EVALUATED')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === 'EVALUATED'
                    ? 'bg-pink-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Evaluated
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center text-slate-400 rounded-3xl glass-card bg-slate-900/40 border border-slate-800 space-y-3">
          <Users className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">No students match your filter</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search terms or filter selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((st) => {
            const primaryCohort = st.primaryCohort;
            const stats = st.stats || {
              totalTasks: 0,
              completedTasks: 0,
              underReviewTasks: 0,
              inProgressTasks: 0,
              progressPercentage: 0,
            };
            const latestEval = st.evaluations?.[0];
            const hasReviewPending = stats.underReviewTasks > 0;

            return (
              <div
                key={st.id}
                onClick={() => onSelectStudent && onSelectStudent(st.id)}
                className={`p-6 rounded-3xl glass-card transition-all flex flex-col justify-between space-y-5 cursor-pointer group hover:-translate-y-1.5 hover:shadow-2xl border ${
                  hasReviewPending
                    ? 'bg-slate-900/80 border-cyan-500/40 shadow-glow'
                    : 'bg-slate-900/60 border-slate-800 hover:border-indigo-500/50'
                }`}
              >
                {/* Card Top: Avatar, Name & Cohort Status */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-black shadow-glow flex-shrink-0 group-hover:scale-105 transition-transform">
                        {st.firstName[0]}
                        {st.lastName[0]}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {st.firstName} {st.lastName}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span className="truncate max-w-[180px]">{st.email}</span>
                        </p>
                      </div>
                    </div>

                    {primaryCohort?.status && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {primaryCohort.status}
                      </span>
                    )}
                  </div>

                  {/* Cohort & Department Info Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        {primaryCohort?.department || 'Department'}
                      </span>
                      {hasReviewPending && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 border border-cyan-500/30 animate-pulse">
                          Needs Review
                        </span>
                      )}
                    </div>

                    <p className="font-semibold text-white line-clamp-1">
                      {primaryCohort?.title || 'General Internship Program'}
                    </p>

                    {/* Supervising Mentor if Admin */}
                    {userRole === 'INSTITUTION_ADMIN' && primaryCohort?.mentor && (
                      <div className="pt-1 border-t border-slate-800/60 text-[11px] text-slate-300 flex items-center gap-1.5">
                        <Award className="w-3 h-3 text-emerald-400" />
                        <span>
                          Mentor:{' '}
                          <strong>
                            {primaryCohort.mentor.firstName} {primaryCohort.mentor.lastName}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Progress Bar for this student */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Deliverables Progress</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {stats.progressPercentage}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex border border-slate-700/60">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        style={{ width: `${stats.progressPercentage}%` }}
                      ></div>
                      <div
                        className="h-full bg-cyan-400"
                        style={{
                          width: `${
                            stats.totalTasks > 0
                              ? (stats.underReviewTasks / stats.totalTasks) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>
                        <strong className="text-white">{stats.completedTasks}</strong> of{' '}
                        {stats.totalTasks} tasks completed
                      </span>
                      {stats.underReviewTasks > 0 && (
                        <span className="text-cyan-300 font-semibold">
                          {stats.underReviewTasks} awaiting review
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Evaluation badge & Action button */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div>
                    {latestEval ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-300 bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20">
                        ⭐ {latestEval.overallScore}/10 Evaluated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full">
                        Evaluation Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all">
                    <span>View Workspace</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
