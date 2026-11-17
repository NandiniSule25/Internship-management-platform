import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CohortDetailsModal from '../components/CohortDetailsModal';
import StudentListView from '../components/StudentListView';
import StudentWorkspace from '../components/StudentWorkspace';
import {
  Briefcase,
  Users,
  Award,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  Filter,
  ArrowRight,
} from 'lucide-react';

export default function InternshipsList({ onSelectCohort, onNavigateToTasks }) {
  const { user } = useAuth();
  const [cohorts, setCohorts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCohortForModal, setSelectedCohortForModal] = useState(null);
  const [viewMode, setViewMode] = useState('INTERNS'); // 'INTERNS' (default) | 'COHORTS'
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cohortsRes, tasksRes, evalsRes] = await Promise.all([
        axios.get('/api/internships'),
        axios.get('/api/tasks').catch(() => ({ data: { tasks: [] } })),
        axios.get('/api/evaluations').catch(() => ({ data: { evaluations: [] } })),
      ]);
      if (cohortsRes.data?.internships) {
        setCohorts(cohortsRes.data.internships);
      }
      if (tasksRes.data?.tasks) {
        setTasks(tasksRes.data.tasks);
      }
      if (evalsRes.data?.evaluations) {
        setEvaluations(evalsRes.data.evaluations);
      }
    } catch (err) {
      console.error('Failed to load internships data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Build the list of interns/students
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

  const filtered = cohorts.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-glow-emerald';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-glow-amber';
      case 'COMPLETED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-glow';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs">Loading interns & internship cohorts...</p>
      </div>
    );
  }

  // FOR MENTORS AND ADMINS: SHOW INTERNS LIST FIRST
  if (user?.role === 'MENTOR' || user?.role === 'INSTITUTION_ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Users className="w-7 h-7 text-indigo-400" />
              <span>
                {user.role === 'MENTOR'
                  ? 'Interns Under My Mentorship'
                  : 'Institutional Interns Directory'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {user.role === 'MENTOR'
                ? `You have ${studentsList.length} interns under your mentorship. Select an intern to view their sprint deliverables, verify submitted proofs, and submit evaluations.`
                : `Managing ${studentsList.length} enrolled interns across all institutional cohorts.`}
            </p>
          </div>

          {/* Toggle between Interns List and Cohorts View */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => {
                setViewMode('INTERNS');
                setSelectedStudentId(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'INTERNS'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Interns List ({studentsList.length})</span>
            </button>

            <button
              onClick={() => setViewMode('COHORTS')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'COHORTS'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>All Cohorts ({cohorts.length})</span>
            </button>
          </div>
        </div>

        {/* Dynamic Display: Interns List vs Selected Intern Workspace vs Cohorts List */}
        {viewMode === 'INTERNS' ? (
          selectedStudent ? (
            /* Selected Intern Workspace */
            <StudentWorkspace
              student={selectedStudent}
              allStudents={studentsList}
              onSelectStudent={(id) => setSelectedStudentId(id)}
              onBackToList={() => setSelectedStudentId(null)}
              onRefresh={loadData}
              userRole={user.role}
            />
          ) : (
            /* Interns List (SHOWN FIRST!) */
            <StudentListView
              students={studentsList}
              onSelectStudent={(id) => setSelectedStudentId(id)}
              userRole={user.role}
              title={
                user.role === 'MENTOR'
                  ? 'Interns Under My Mentorship'
                  : 'Institutional Enrolled Interns'
              }
              subtitle="Click on any intern to view their complete data, allocated sprint deliverables, proof verification, and evaluations."
            />
          )
        ) : (
          /* Cohorts Grid */
          <div className="space-y-6 animate-in fade-in">
            {/* Filter */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Showing {filtered.length} of {cohorts.length} cohorts
              </span>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
                {['ALL', 'ACTIVE', 'PENDING', 'COMPLETED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-indigo-600 text-white shadow-glow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((cohort) => (
                <div
                  key={cohort.id}
                  className="glass-card p-6 rounded-2xl border-slate-800 bg-slate-900/60 glass-card-hover flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {cohort.department}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          cohort.status
                        )}`}
                      >
                        {cohort.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white line-clamp-2">{cohort.title}</h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {cohort.description || 'Comprehensive internship programme and deliverables.'}
                    </p>

                    {/* Date range */}
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        {new Date(cohort.startDate).toLocaleDateString()} —{' '}
                        {new Date(cohort.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Supervisor & Student card */}
                    <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Mentor:</span>
                        </span>
                        <span className="font-semibold text-white">
                          {cohort.mentor
                            ? `${cohort.mentor.firstName} ${cohort.mentor.lastName}`
                            : 'Unassigned'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>Intern:</span>
                        </span>
                        <span className="font-semibold text-white">
                          {cohort.intern
                            ? `${cohort.intern.firstName} ${cohort.intern.lastName}`
                            : 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedCohortForModal(cohort)}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {cohort.intern && (
                      <button
                        onClick={() => {
                          setSelectedStudentId(cohort.intern.id);
                          setViewMode('INTERNS');
                        }}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Intern Workspace →</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal for Cohort Details */}
        {selectedCohortForModal && (
          <CohortDetailsModal
            cohort={selectedCohortForModal}
            isOpen={Boolean(selectedCohortForModal)}
            onClose={() => setSelectedCohortForModal(null)}
            onNavigateToTasks={(cohortId) => {
              setSelectedCohortForModal(null);
              if (onNavigateToTasks) onNavigateToTasks(cohortId);
            }}
          />
        )}
      </div>
    );
  }

  // FOR INTERNS: SHOW THEIR ENROLLED COHORTS
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-indigo-400" />
            <span>My Enrolled Internships</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Track deadlines, log daily progress, and view performance milestones.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
          {['ALL', 'ACTIVE', 'PENDING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((cohort) => (
          <div
            key={cohort.id}
            className="glass-card p-6 rounded-2xl border-slate-800 bg-slate-900/60 glass-card-hover flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {cohort.department}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                    cohort.status
                  )}`}
                >
                  {cohort.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white line-clamp-2">{cohort.title}</h3>

              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {cohort.description || 'Comprehensive internship programme and deliverables.'}
              </p>

              {/* Date range */}
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {new Date(cohort.startDate).toLocaleDateString()} —{' '}
                  {new Date(cohort.endDate).toLocaleDateString()}
                </span>
              </div>

              {/* Supervisor & Student card */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mentor:</span>
                  </span>
                  <span className="font-semibold text-white">
                    {cohort.mentor
                      ? `${cohort.mentor.firstName} ${cohort.mentor.lastName}`
                      : 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedCohortForModal(cohort)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  if (onNavigateToTasks) onNavigateToTasks(cohort.id);
                }}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Go to Tasks →</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Cohort Details */}
      {selectedCohortForModal && (
        <CohortDetailsModal
          cohort={selectedCohortForModal}
          isOpen={Boolean(selectedCohortForModal)}
          onClose={() => setSelectedCohortForModal(null)}
          onNavigateToTasks={(cohortId) => {
            setSelectedCohortForModal(null);
            if (onNavigateToTasks) onNavigateToTasks(cohortId);
          }}
        />
      )}
    </div>
  );
}
