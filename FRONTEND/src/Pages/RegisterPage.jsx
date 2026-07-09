import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff,
  FiShield, FiCpu, FiZap, FiBookOpen, FiCheckCircle
} from 'react-icons/fi';
import api from '../Utils/api';
import Toast from '../Components/Common/Toast.jsx';
import Navbar from '../Components/Common/Navbar.jsx';

/* ── Background ──────────────────────────────── */
const Background = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-indigo-100/40 to-blue-100/20 rounded-full blur-[160px] animate-ray-2" />
    <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-purple-100/30 to-pink-100/20 rounded-full blur-[140px] animate-ray-1" />
    <div className="absolute top-[25%] right-[3%] w-[280px] h-[280px] bg-violet-100/25 blur-[80px] animate-morph" />
    {[
      { w: 70, color: 'bg-indigo-200/20', x: '92%', y: '8%',  dur: 7 },
      { w: 50, color: 'bg-blue-200/15',   x: '3%',  y: '22%', dur: 9 },
      { w: 40, color: 'bg-purple-200/20', x: '18%', y: '70%', dur: 6 },
      { w: 35, color: 'bg-cyan-200/15',   x: '80%', y: '80%', dur: 8 },
    ].map((s, i) => (
      <motion.div key={i} className="absolute" style={{ left: s.x, top: s.y }}
        animate={{ y: [-15, 15, -15], rotate: [0, 180, 360], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: s.dur, delay: i * 0.8, repeat: Infinity, ease: 'easeInOut' }}>
        <div className={`${s.color} rounded-full blur-sm`} style={{ width: s.w, height: s.w }} />
      </motion.div>
    ))}
    {Array.from({ length: 7 }).map((_, i) => (
      <motion.div key={`p${i}`}
        className="absolute rounded-full bg-indigo-400/20"
        style={{ width: 4 + i % 3 * 3, height: 4 + i % 3 * 3, left: `${8 + i * 13}%`, top: `${32 + i % 4 * 14}%` }}
        animate={{ y: [0, -130, -250], opacity: [0.3, 0.6, 0], scale: [1, 1.3, 0.4] }}
        transition={{ duration: 9 + i, delay: i * 1.2, repeat: Infinity, ease: 'easeOut' }} />
    ))}
  </div>
);

/* ── Fancy Input ──────────────────────────────── */
const FancyInput = React.forwardRef(({ label, icon: Icon, error, type = 'text', ...rest }, ref) => {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{label}</label>
      <div className={`relative flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-all duration-300 ${
        focused ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-sm' : error ? 'border-red-300' : 'border-slate-200 hover:border-slate-300'
      }`}>
        <Icon size={14} className={`flex-shrink-0 transition-colors duration-200 ${focused ? 'text-indigo-500' : 'text-slate-300'}`} />
        <input
          ref={ref} type={isPassword && showPw ? 'text' : type}
          className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-300 focus:outline-none"
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          {...rest}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPw(v => !v)} className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0">
            {showPw ? <FiEyeOff size={13} /> : <FiEye size={13} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-[11px] text-red-500 font-medium">{error}</motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});
FancyInput.displayName = 'FancyInput';

/* ── Password strength ───────────────────────── */
const getStrength = (pass) => {
  if (!pass) return { label: '', color: 'bg-slate-200', width: 'w-0', text: 'text-slate-400' };
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[a-z]/.test(pass)) score++;
  if (/\d/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  if (score <= 2) return { label: 'Weak',   color: 'bg-red-500',    width: 'w-1/3', text: 'text-red-500' };
  if (score <= 4) return { label: 'Medium', color: 'bg-amber-500',  width: 'w-2/3', text: 'text-amber-500' };
  return             { label: 'Strong',  color: 'bg-emerald-500', width: 'w-full', text: 'text-emerald-500' };
};

/* ── Info panel content ──────────────────────── */
const PERKS = [
  { icon: <FiCpu />,       label: '14 Autonomous Agents',  desc: 'A LangGraph pipeline of specialized agents each with a defined research role.' },
  { icon: <FiBookOpen />,  label: 'Literature Synthesis',  desc: 'Merge findings from multiple papers into one cohesive review with one click.' },
  { icon: <FiZap />,       label: 'Under 30 Seconds',      desc: 'Complete deep analysis of a research paper in under half a minute.' },
  { icon: <FiCheckCircle />, label: 'Zero Hallucinations', desc: 'Grounded answers backed strictly by the content of your uploaded papers.' },
];

const STEPS = [
  { num: '1', label: 'Create your account', desc: 'Quick sign-up, no credit card needed.' },
  { num: '2', label: 'Upload your paper',   desc: 'PDF up to 25 MB — securely processed.' },
  { num: '3', label: 'Get instant insights', desc: 'Chat, maps, reviews, and flashcards ready.' },
];

/* ════════════════════════════════════════════
   REGISTER PAGE
═══════════════════════════════════════════ */
const RegisterPage = () => {
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const passwordValue = watch('password', '');
  const strength = getStrength(passwordValue);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }
    if (!data.terms) {
      setToast({ message: 'You must accept the terms and conditions', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      if (response.data?.success) {
        setToast({ message: 'OTP sent to email successfully!', type: 'success' });
        setTimeout(() => navigate('/verify-otp', { state: { userId: response.data.userId, email: data.email } }), 1500);
      }
    } catch (error) {
      setToast({ message: error.response?.data?.message || error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-indigo-50/30 font-sans relative overflow-x-hidden">
      <Navbar />
      <Background />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex-1 flex items-stretch z-10 relative">

        {/* ── LEFT FORM PANEL ──────────────────── */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10">
          <motion.div
            className="w-full max-w-md space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/90 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/50 p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

              {/* Header */}
              <div className="text-center space-y-2">
                <motion.div
                  className="mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                  style={{ width: 52, height: 52 }}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <FiUser size={22} />
                </motion.div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create your account</h1>
                <p className="text-xs text-slate-400 font-medium">Start your AI-powered research journey</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FancyInput
                  label="Full Name" icon={FiUser}
                  placeholder="Jane Doe"
                  error={errors.fullName?.message}
                  {...register('fullName', { required: 'Full name is required' })}
                />
                <FancyInput
                  label="Email Address" icon={FiMail} type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                  })}
                />
                <div className="space-y-2">
                  <FancyInput
                    label="Password" icon={FiLock} type="password"
                    placeholder="Min. 8 characters"
                    error={errors.password?.message}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'At least 8 characters required' }
                    })}
                  />
                  {/* Strength bar */}
                  {passwordValue && (
                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${strength.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: strength.width === 'w-1/3' ? '33%' : strength.width === 'w-2/3' ? '66%' : '100%' }}
                          transition={{ duration: 0.35 }}
                        />
                      </div>
                      <p className={`text-[10px] font-bold ${strength.text}`}>Password strength: {strength.label}</p>
                    </div>
                  )}
                </div>
                <FancyInput
                  label="Confirm Password" icon={FiLock} type="password"
                  placeholder="Repeat password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword', { required: 'Please confirm your password' })}
                />

                {/* Terms */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox" id="terms"
                    className="mt-0.5 h-4 w-4 accent-indigo-600 cursor-pointer flex-shrink-0"
                    {...register('terms', { required: true })}
                  />
                  <span className="text-xs text-slate-500 font-medium leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-indigo-600 hover:underline font-semibold">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-indigo-600 hover:underline font-semibold">Privacy Policy</a>
                  </span>
                </label>

                <motion.button
                  type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/20 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                >
                  {loading ? (
                    <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                  ) : (
                    <>Create Account <FiArrowRight size={13} /></>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Already a member?</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Login CTA */}
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors duration-200"
              >
                Sign in to existing account <FiArrowRight size={12} />
              </Link>
            </div>

            <p className="text-center text-[10px] text-slate-400 font-medium">
              🔒 Encrypted · No spam · Unsubscribe anytime
            </p>
          </motion.div>
        </div>

        {/* ── RIGHT INFO PANEL ─────────────────── */}
        <motion.aside
          className="hidden lg:flex flex-col justify-between w-[48%] xl:w-[45%] bg-gradient-to-bl from-indigo-600 via-violet-600 to-purple-700 text-white px-12 py-14 relative overflow-hidden"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 70 }}
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

          <div className="relative z-10 space-y-10">
            <div className="space-y-3">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-extrabold uppercase tracking-widest"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <FiShield size={10} /> Free to start · No credit card
              </motion.div>
              <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight">
                Everything you need to master any paper
              </h2>
              <p className="text-white/70 text-sm leading-relaxed font-medium max-w-sm">
                Sign up in 30 seconds and immediately unlock a full suite of AI research tools designed for scientists, students, and writers.
              </p>
            </div>

            {/* Perks */}
            <ul className="space-y-5">
              {PERKS.map((p, i) => (
                <motion.li key={i} className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}>
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 text-white/90 mt-0.5">
                    {p.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{p.label}</p>
                    <p className="text-white/60 text-[11px] font-medium leading-relaxed mt-0.5">{p.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* How it works steps */}
          <div className="relative z-10 mt-8">
            <p className="text-white/50 text-[10px] font-extrabold uppercase tracking-widest mb-4">Get started in 3 steps</p>
            <div className="space-y-3">
              {STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-4 bg-white/8 border border-white/10 rounded-2xl px-4 py-3"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/15 border border-white/20 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{step.label}</p>
                    <p className="text-white/55 text-[11px] font-medium">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
};

export default RegisterPage;
