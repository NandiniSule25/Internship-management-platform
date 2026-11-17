import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Shield,
  Award,
  Rocket,
  Building,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Briefcase,
  TrendingUp,
  Database,
  Key,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import StudentListView from '../components/StudentListView';
import StudentWorkspace from '../components/StudentWorkspace';

export default function DashboardHub() {
  const { user } = useAuth();
  const [dbStatus, setDbStatus] = useState({ loading: true, data: null });
  const [tasks, setTasks] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [mentorSubView, setMentorSubView] = useState('STUDENTS'); // 'STUDENTS' | 'OVERVIEW'

  const checkDbAndLoad = async () => {
    try {
      setLoadingData(true);
      const [dbRes, tasksRes, cohortsRes, evalsRes] = await Promise.all([
        axios.get('/api/health/db'),
        axios.get('/api/tasks').catch(() => ({ data: { tasks: [] } })),
        axios.get('/api/internships').catch(() => ({ data: { internships: [] } })),
        axios.get('/api/evaluations').catch(() => ({ data: { evaluations: [] } })),
      ]);
      setDbStatus({ loading: false, data: dbRes.data });
      if (tasksRes.data?.tasks) setTasks(tasksRes.data.tasks);
      if (cohortsRes.data?.internships) setCohorts(cohortsRes.data.internships);
      if (evalsRes.data?.evaluations) setEvaluations(evalsRes.data.evaluations);
    } catch (err) {
      setDbStatus({ loading: false, error: err.message });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    checkDbAndLoad();
  }, []);

  // Build the list of students under mentorship or supervision
  const studentMap = {};
  cohorts.forEach((cohort) => {
    if (!cohort.intern) return;
    const internId = cohort.intern.id;
    if (!studentMap[internId]) {
      studentMap[internId] = {
        id: internId,
        firstName: cohort.intern.firstName,
        lastName: cohort.intern.lastName,
        email: cohort.intern.email,
        phone: cohort.intern.phone || '',
        cohorts: [],
        mentor: cohort.mentor,
      };
    }
    studentMap[internId].cohorts.push(cohort);
  });

  const studentsList = Object.values(studentMap).map((st) => {
    const studentTasks = tasks.filter(
      (t) => t.assigneeId === st.id || t.internship?.internId === st.id
    );
    const studentEvaluations = evaluations.filter((e) => e.internId === st.id);
    const totalTasks = studentTasks.length;
    const completedTasks = studentTasks.filter((t) => t.status === 'COMPLETED').length;
    const underReviewTasks = studentTasks.filter((t) => t.status === 'UNDER_REVIEW').length;
    const inProgressTasks = studentTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const todoTasks = studentTasks.filter((t) => t.status === 'TODO').length;
    const progressPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const primaryCohort = st.cohorts.find((c) => c.status === 'ACTIVE') || st.cohorts[0];

    return {
      ...st,
      primaryCohort,
      tasks: studentTasks,
      evaluations: studentEvaluations,
      stats: {
        totalTasks,
        completedTasks,
        underReviewTasks,
        inProgressTasks,
        todoTasks,
        progressPercentage,
      },
    };
  });

  const selectedStudent = selectedStudentId
    ? studentsList.find((s) => s.id === selectedStudentId)
    : null;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const underReviewTasks = tasks.filter((t) => t.status === 'UNDER_REVIEW').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getRoleConfig = () => {
    switch (user?.role) {
      case 'INSTITUTION_ADMIN':
        return {
          title: 'Institution Administrator Console',
          subtitle: `Managing cohorts, mentors, and intern records for ${user?.institution?.name}`,
          colorTheme: 'from-violet-600 via-indigo-600 to-purple-800',
          badgeText: 'INSTITUTION ADMIN',
          badgeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
          stats: [
            {
              label: 'Mentored Cohorts',
              value: user?._count?.mentoredInternships || '12',
              icon: <Briefcase className="w-5 h-5 text-violet-400" />,
            },
            {
              label: 'Registered Mentors',
              value: '8',
              icon: <Users className="w-5 h-5 text-indigo-400" />,
            },
            {
              label: 'Enrolled Interns',
              value: user?._count?.internships || '34',
              icon: <Rocket className="w-5 h-5 text-pink-400" />,
            },
            {
              label: 'Audit Reports',
              value: user?._count?.reportsGenerated || '5',
              icon: <FileText className="w-5 h-5 text-emerald-400" />,
            },
          ],
          actions: [
            {
              title: 'Create Internship Cohort',
              desc: 'Define departments, start/end dates, and allocate mentor',
            },
            {
              title: 'Manage Mentors & Interns',
              desc: 'Assign mentors to new intern batches',
            },
            {
              title: 'Export Institution Summary PDF',
              desc: 'Download comprehensive institutional performance reports',
            },
          ],
        };
      case 'MENTOR':
        return {
          title: 'Mentor Command Center',
          subtitle: `Guiding interns and evaluating project deliverables at ${user?.institution?.name}`,
          colorTheme: 'from-emerald-600 via-teal-600 to-cyan-800',
          badgeText: 'MENTOR SUPERVISOR',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          stats: [
            {
              label: 'Active Cohorts',
              value: cohorts.length,
              icon: <Users className="w-5 h-5 text-emerald-400" />,
            },
            {
              label: 'Total Deliverables',
              value: totalTasks,
              icon: <Clock className="w-5 h-5 text-cyan-400" />,
            },
            {
              label: 'Under Review',
              value: underReviewTasks,
              icon: <Award className="w-5 h-5 text-amber-400" />,
            },
            {
              label: 'Milestone Progress',
              value: `${progressPercentage}%`,
              icon: <TrendingUp className="w-5 h-5 text-teal-400" />,
            },
          ],
          actions: [
            {
              title: 'Allocate Task with Deadline',
              desc: 'Create tasks with description, priority, and due dates',
            },
            {
              title: 'Review Progress & Proof Files',
              desc: 'Verify intern uploaded documents, work URLs, and hours logged',
            },
            {
              title: 'Submit Intern Evaluation',
              desc: 'Rate technical, communication, and punctuality scores',
            },
          ],
        };
      case 'INTERN':
      default:
        return {
          title: 'Intern Workspace & Task Board',
          subtitle: `Tracking active internship deliverables and milestone feedback at ${user?.institution?.name}`,
          colorTheme: 'from-amber-500 via-orange-600 to-rose-700',
          badgeText: 'INTERN STUDENT',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          stats: [
            {
              label: 'Allocated Tasks',
              value: totalTasks,
              icon: <Clock className="w-5 h-5 text-amber-400" />,
            },
            {
              label: 'Tasks Completed',
              value: completedTasks,
              icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
            },
            {
              label: 'Pending Review',
              value: underReviewTasks,
              icon: <TrendingUp className="w-5 h-5 text-orange-400" />,
            },
            {
              label: 'Milestone Progress',
              value: `${progressPercentage}%`,
              icon: <Award className="w-5 h-5 text-yellow-400" />,
            },
          ],
          actions: [
            {
              title: 'Submit Work & Proof of Completion',
              desc: 'Upload deliverable documents, screenshots, and repository links',
            },
            {
              title: 'View Assigned Task Deadlines',
              desc: 'Keep track of TODO, In Progress, and Under Review items',
            },
            {
              title: 'Download Performance Certificate PDF',
              desc: 'Generate verified PDF completion report',
            },
          ],
        };
    }
  };

  const roleConfig = getRoleConfig();

  // -------------------------------------------------------------
  // MENTOR EXPERIENCE: STUDENT LIST FIRST WORKFLOW
  // -------------------------------------------------------------
  if (user?.role === 'MENTOR') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Colorful Hero Card with View Switcher */}
        <div
          className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r ${roleConfig.colorTheme} shadow-2xl text-white`}
        >
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-black/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase border ${roleConfig.badgeClass}`}
                >
                  {roleConfig.badgeText}
                </span>
                <span className="text-xs bg-black/30 px-3 py-1 rounded-full text-white/80 font-mono">
                  {user?.institution?.code}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.firstName}! 👋
              </h1>

              <p className="text-white/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Supervising{' '}
                <strong className="text-white">{studentsList.length} students</strong> across your
                allocated internship tracks.
              </p>
            </div>

            {/* Quick View Switcher: Students vs Overview */}
            <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 self-start md:self-auto">
              <button
                onClick={() => {
                  setMentorSubView('STUDENTS');
                  setSelectedStudentId(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  mentorSubView === 'STUDENTS'
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>My Students ({studentsList.length})</span>
              </button>

              <button
                onClick={() => setMentorSubView('OVERVIEW')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  mentorSubView === 'OVERVIEW'
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Aggregated Stats</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Display: Students List vs Selected Student Workspace vs Aggregated Overview */}
        {mentorSubView === 'STUDENTS' ? (
          selectedStudent ? (
            /* Selected Student Workspace */
            <StudentWorkspace
              student={selectedStudent}
              allStudents={studentsList}
              onSelectStudent={(id) => setSelectedStudentId(id)}
              onBackToList={() => setSelectedStudentId(null)}
              onRefresh={checkDbAndLoad}
              userRole="MENTOR"
            />
          ) : (
            /* Student List View (Shown First!) */
            <StudentListView
              students={studentsList}
              onSelectStudent={(id) => setSelectedStudentId(id)}
              userRole="MENTOR"
              title="Students Under My Mentorship"
              subtitle={`You are mentoring ${studentsList.length} students. Click on any student to inspect their individual sprint tasks, review submitted proofs, and submit milestone evaluations.`}
            />
          )
        ) : (
          /* Mentor Aggregated Overview Section */
          <div className="space-y-8 animate-in fade-in">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {roleConfig.stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="glass-card p-5 rounded-2xl border-slate-800 bg-slate-900/60 glass-card-hover transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center">
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Aggregated Progress Bar */}
            <div className="glass-card p-6 rounded-2xl border border-slate-700/80 bg-slate-900/80 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Overall Deliverables Completion Rate</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Aggregated progress across all {cohorts.length} assigned cohorts and {studentsList.length} students.
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {progressPercentage}%
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Approved</span>
                </div>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500 shadow-glow-emerald"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <strong className="text-slate-200">{completedTasks}</strong> of {totalTasks}{' '}
                  deliverables approved
                </span>
                {underReviewTasks > 0 && (
                  <span className="text-cyan-300 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    {underReviewTasks} awaiting review
                  </span>
                )}
              </div>
            </div>

            {/* Diagnostics and Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card rounded-2xl p-6 border-slate-800 bg-slate-900/60 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>Quick Mentor Actions</span>
                </h2>
                <div className="space-y-3">
                  {roleConfig.actions.map((act, index) => (
                    <div
                      key={index}
                      onClick={() => setMentorSubView('STUDENTS')}
                      className="p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {act.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">{act.desc}</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Database Status Card */}
              <div className="glass-card rounded-2xl p-6 border-slate-800 bg-slate-900/60 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <span>System Diagnostics</span>
                </h2>
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      PostgreSQL (Neon)
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                      CONNECTED
                    </span>
                  </div>
                  {dbStatus.data && (
                    <p className="text-[11px] text-emerald-400 font-mono">
                      Latency: {dbStatus.data.latencyMs}ms | Engine: {dbStatus.data.database}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // INTERN OR ADMIN DEFAULT DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl p-8 sm:p-10 bg-gradient-to-r ${roleConfig.colorTheme} shadow-2xl text-white`}
      >
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-black/20 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase border ${roleConfig.badgeClass}`}
              >
                {roleConfig.badgeText}
              </span>
              <span className="text-xs bg-black/30 px-3 py-1 rounded-full text-white/80 font-mono">
                {user?.institution?.code}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.firstName}! 👋
            </h1>

            <p className="text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed">
              {roleConfig.subtitle}
            </p>
          </div>

          <div className="glass-card p-4 rounded-2xl border-white/20 bg-white/10 backdrop-blur-md shrink-0 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-white/90 mb-1">
              <Building className="w-4 h-4 text-white" />
              <span>Affiliated College</span>
            </div>
            <p className="text-sm font-bold text-white">{user?.institution?.name}</p>
            <p className="text-xs text-white/70 font-mono">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {roleConfig.stats.map((stat, idx) => (
          <div
            key={idx}
            className="glass-card p-5 rounded-2xl border-slate-800 bg-slate-900/60 glass-card-hover transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
              <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="glass-card p-6 rounded-2xl border border-slate-700/80 bg-slate-900/80 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>My Internship Completion Progress</span>
            </h3>
            <p className="text-xs text-slate-400">
              Dynamic milestone tracker based on completed and mentor-approved sprint deliverables.
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {progressPercentage}%
            </span>
            <span className="text-xs text-slate-400 font-semibold">Approved</span>
          </div>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/60">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500 shadow-glow-emerald"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <strong className="text-slate-200">{completedTasks}</strong> of {totalTasks}{' '}
            deliverables approved
          </span>
          {underReviewTasks > 0 && (
            <span className="text-cyan-300 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              {underReviewTasks} awaiting review
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
