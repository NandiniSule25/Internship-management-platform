import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Shield,
  Award,
  Rocket,
  Lock,
  Mail,
  User,
  Building,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';

export default function AuthPage() {
  const { login, register, authError, setAuthError } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  const [customInstitution, setCustomInstitution] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'INTERN', // default
    institutionId: '',
    newInstitutionName: '',
    newInstitutionCode: '',
  });

  // Fetch institutions for dropdown
  useEffect(() => {
    async function fetchInstitutions() {
      try {
        const res = await axios.get('/api/auth/institutions');
        if (res.data?.status === 'success') {
          setInstitutions(res.data.institutions);
          if (res.data.institutions.length > 0) {
            setFormData((prev) => ({ ...prev, institutionId: res.data.institutions[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load institutions:', err);
      }
    }
    fetchInstitutions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    if (mode === 'login') {
      await login(formData.email, formData.password);
    } else {
      await register(formData);
    }
    setLoading(false);
  };

  // Quick fill test credentials for fast testing
  const quickFill = (role) => {
    setMode('login');
    if (role === 'ADMIN') {
      setFormData((prev) => ({ ...prev, email: 'admin.test@ait.edu', password: 'password123' }));
    } else if (role === 'MENTOR') {
      setFormData((prev) => ({ ...prev, email: 'mentor.test@ait.edu', password: 'password123' }));
    } else if (role === 'INTERN') {
      setFormData((prev) => ({ ...prev, email: 'intern.test@ait.edu', password: 'password123' }));
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-69px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden bg-gradient-to-br from-[#070b14] via-[#0d1424] to-[#141226]">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Creative Hero Presentation */}
        <div className="lg:col-span-5 space-y-6 text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Role-Based Internship Operating System</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Coordinate Internships with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Precision & Style
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            A unified multi-institution portal connecting colleges, industry mentors, and aspiring interns with real-time task allocations, evaluations, and downloadable reports.
          </p>

          {/* Feature Highlights Cards */}
          <div className="space-y-3 pt-2">
            <div className="glass-card p-3 rounded-xl flex items-center gap-3.5 border-l-4 border-l-violet-500">
              <div className="w-9 h-9 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Institution Admin Dashboard</p>
                <p className="text-[11px] text-slate-400">Oversee cohorts, mentor allocation & cross-college analytics</p>
              </div>
            </div>

            <div className="glass-card p-3 rounded-xl flex items-center gap-3.5 border-l-4 border-l-emerald-500">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Mentor Command Center</p>
                <p className="text-[11px] text-slate-400">Task deadlines, milestone progress tracking & evaluations</p>
              </div>
            </div>

            <div className="glass-card p-3 rounded-xl flex items-center gap-3.5 border-l-4 border-l-amber-500">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Rocket className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Intern Portal & PDF Reports</p>
                <p className="text-[11px] text-slate-400">Daily update notes, task kanban & performance certificates</p>
              </div>
            </div>
          </div>

          {/* Quick Demo Accounts Banner */}
          <div className="glass-card p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-indigo-300">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>Instant One-Click Test Accounts</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickFill('ADMIN')}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 transition-all cursor-pointer"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => quickFill('MENTOR')}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
              >
                🎓 Mentor
              </button>
              <button
                type="button"
                onClick={() => quickFill('INTERN')}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
              >
                🚀 Intern
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Colorful Auth Form Card */}
        <div className="lg:col-span-7">
          <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/60 bg-slate-900/80">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-slate-800/80 border border-slate-700">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Alert */}
            {authError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration Specific: Role Selector Cards */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {/* Admin Card */}
                    <div
                      onClick={() => handleRoleSelect('INSTITUTION_ADMIN')}
                      className={`p-3 rounded-xl cursor-pointer border text-center transition-all ${
                        formData.role === 'INSTITUTION_ADMIN'
                          ? 'bg-violet-950/40 border-violet-500 shadow-glow-purple ring-1 ring-violet-500'
                          : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-7 h-7 mx-auto mb-1.5 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">
                        <Shield className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-white">Admin</p>
                      <p className="text-[10px] text-slate-400">College / Inst</p>
                    </div>

                    {/* Mentor Card */}
                    <div
                      onClick={() => handleRoleSelect('MENTOR')}
                      className={`p-3 rounded-xl cursor-pointer border text-center transition-all ${
                        formData.role === 'MENTOR'
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-glow-emerald ring-1 ring-emerald-500'
                          : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-7 h-7 mx-auto mb-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-white">Mentor</p>
                      <p className="text-[10px] text-slate-400">Guides Interns</p>
                    </div>

                    {/* Intern Card */}
                    <div
                      onClick={() => handleRoleSelect('INTERN')}
                      className={`p-3 rounded-xl cursor-pointer border text-center transition-all ${
                        formData.role === 'INTERN'
                          ? 'bg-amber-950/40 border-amber-500 shadow-glow-amber ring-1 ring-amber-500'
                          : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="w-7 h-7 mx-auto mb-1.5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Rocket className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-white">Intern</p>
                      <p className="text-[10px] text-slate-400">Student</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Names for Registration */}
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        className="glass-input w-full pl-9 pr-3 py-2 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@example.edu"
                    className="glass-input w-full pl-9 pr-3 py-2 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="glass-input w-full pl-9 pr-3 py-2 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Registration Institution Choice */}
              {mode === 'register' && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Institution / College</label>
                    <button
                      type="button"
                      onClick={() => setCustomInstitution(!customInstitution)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      {customInstitution ? 'Select Existing Institution' : '+ Register New Institution'}
                    </button>
                  </div>

                  {!customInstitution ? (
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                      <select
                        name="institutionId"
                        value={formData.institutionId}
                        onChange={handleChange}
                        className="glass-input w-full pl-9 pr-3 py-2 rounded-lg text-xs appearance-none cursor-pointer bg-slate-900"
                      >
                        {institutions.map((inst) => (
                          <option key={inst.id} value={inst.id} className="bg-slate-900 text-white">
                            {inst.name} ({inst.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <input
                          type="text"
                          name="newInstitutionName"
                          placeholder="Full College Name"
                          required={customInstitution}
                          value={formData.newInstitutionName}
                          onChange={handleChange}
                          className="glass-input w-full px-3 py-2 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          name="newInstitutionCode"
                          placeholder="Code (e.g. IITB)"
                          required={customInstitution}
                          value={formData.newInstitutionCode}
                          onChange={handleChange}
                          className="glass-input w-full px-3 py-2 rounded-lg text-xs uppercase"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
