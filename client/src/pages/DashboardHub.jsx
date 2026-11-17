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

  // -------------------------------------------------------------
  // MENTOR EXPERIENCE: STUDENT LIST IMMEDIATELY AT TOP
  // -------------------------------------------------------------
  if (user?.role === 'MENTOR') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Mentor Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Mentor Supervisor Console
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {studentsList.length} Interns Assigned
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Welcome, {user.firstName} {user.lastName}</span>
            </h1>
          </div>

          {/* View Mode Toggle: Students vs Aggregated Overview */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs self-start sm:self-auto">
            <button
              onClick={() => {
                setMentorSubView('STUDENTS');
                setSelectedStudentId(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                mentorSubView === 'STUDENTS'
                  ? 'bg-emerald-600 text-white shadow-glow-emerald'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Interns List ({studentsList.length})</span>
            </button>

            <button
              onClick={() => setMentorSubView('OVERVIEW')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                mentorSubView === 'OVERVIEW'
                  ? 'bg-emerald-600 text-white shadow-glow-emerald'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Overall Stats</span>
            </button>
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
            /* Student List View (SHOWN IMMEDIATELY AT TOP!) */
            <StudentListView
              students={studentsList}
              onSelectStudent={(id) => setSelectedStudentId(id)}
              userRole="MENTOR"
              title="Students Under My Mentorship"
              subtitle={`You are mentoring ${studentsList.length} students. Click on any student card below to view their individual sprint deliverables, verify submitted proofs, and submit evaluations.`}
            />
          )
        ) : (
          /* Mentor Aggregated Overview Section */
          <div className="space-y-6 animate-in fade-in">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-2xl border-slate-800 bg-slate-900/60">
                <span className="text-xs font-semibold text-slate-400">Active Cohorts</span>
                <p className="text-2xl font-black text-white mt-1">{cohorts.length}</p>
              </div>
              <div className="glass-card p-5 rounded-2xl border-slate-800 bg-slate-900/60">
                <span className="text-xs font-semibold text-slate-400">Total Deliverables</span>
                <p className="text-2xl font-black text-white mt-1">{totalTasks}</p>
              </div>
              <div className="glass-card p-5 rounded-2xl border-slate-800 bg-slate-900/60">
                <span className="text-xs font-semibold text-slate-400">Under Review</span>
                <p className="text-2xl font-black text-amber-400 mt-1">{underReviewTasks}</p>
              </div>
              <div className="glass-card p-5 rounded-2xl border-slate-800 bg-slate-900/60">
                <span className="text-xs font-semibold text-slate-400">Milestone Progress</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">{progressPercentage}%</p>
              </div>
            </div>

            {/* Aggregated Progress Bar */}
            <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Overall Deliverables Progress across all cohorts</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold">{progressPercentage}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // INTERN WORKSPACE
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Intern Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-600 to-rose-700 text-white shadow-2xl">
        <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-black/20 border border-white/20">
          Enrolled Student
        </span>
        <h1 className="text-3xl font-extrabold mt-3">Welcome, {user?.firstName}! 👋</h1>
        <p className="text-white/80 text-sm mt-1">
          Tracking your active sprint deliverables and feedback at {user?.institution?.name}.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>My Internship Completion Progress</span>
          </span>
          <span className="font-mono text-emerald-400 font-bold">{progressPercentage}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>{completedTasks} of {totalTasks} deliverables approved</span>
          {underReviewTasks > 0 && (
            <span className="text-cyan-300 font-semibold">{underReviewTasks} awaiting review</span>
          )}
        </div>
      </div>
    </div>
  );
}
