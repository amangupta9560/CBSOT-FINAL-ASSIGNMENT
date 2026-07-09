import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  FiMail, FiLock, FiArrowRight, FiCpu, FiEye, FiEyeOff,
  FiShield, FiZap, FiBookOpen, FiMessageSquare, FiAward
} from 'react-icons/fi';
import { AuthContext } from '../Context/AuthContext.jsx';
import Navbar from '../Components/Common/Navbar.jsx';

/* ── Shared background layer ────────────────── */
const Background = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute -top-40 right-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-blue-100/40 to-indigo-100/20 rounded-full blur-[160px] animate-ray-1" />
    <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-purple-100/30 to-pink-100/20 rounded-full blur-[140px] animate-ray-2" />
    <div className="absolute top-[30%] left-[3%] w-[280px] h-[280px] bg-indigo-100/25 blur-[80px] animate-morph" />
    {[
      { w: 80, color: 'bg-blue-200/20',   x: '5%',  y: '10%', dur: 7 },
      { w: 55, color: 'bg-indigo-200/15', x: '88%', y: '20%', dur: 9 },
      { w: 40, color: 'bg-purple-200/20', x: '80%', y: '65%', dur: 6 },
      { w: 35, color: 'bg-cyan-200/15',   x: '15%', y: '78%', dur: 8 },
    ].map((s, i) => (
      <motion.div key={i} className="absolute" style={{ left: s.x, top: s.y }}
        animate={{ y: [-15, 15, -15], rotate: [0, 180, 360], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: s.dur, delay: i * 0.8, repeat: Infinity, ease: 'easeInOut' }}>
        <div className={`${s.color} rounded-full blur-sm`} style={{ width: s.w, height: s.w }} />
      </motion.div>
    ))}
    {Array.from({ length: 7 }).map((_, i) => (
      <motion.div key={`p${i}`}
        className="absolute rounded-full bg-blue-400/20"
        style={{ width: 4 + i % 3 * 3, height: 4 + i % 3 * 3, left: `${12 + i * 12}%`, top: `${35 + i % 4 * 14}%` }}
        animate={{ y: [0, -140, -260], opacity: [0.3, 0.6, 0], scale: [1, 1.3, 0.4] }}
        transition={{ duration: 9 + i, delay: i * 1.3, repeat: Infinity, ease: 'easeOut' }} />
    ))}
  </div>
);

/* ── Fancy Input ────────────────────────────── */
const FancyInput = React.forwardRef(({ label, icon: Icon, error, type = 'text', ...rest }, ref) => {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{label}</label>
      <div className={`relative flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-all duration-300 ${
        focused ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-sm' : error ? 'border-red-300' : 'border-slate-200 hover:border-slate-300'
      }`}>
        <Icon size={14} className={`flex-shrink-0 transition-colors duration-200 ${focused ? 'text-blue-500' : 'text-slate-300'}`} />
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

/* ── Features list shown in the left panel ─── */
const INFO_FEATURES = [
  { icon: <FiCpu />, label: '14 Autonomous AI Agents', desc: 'Coordinated LangGraph pipeline that parses, analyzes, and synthesizes literature.' },
  { icon: <FiMessageSquare />, label: 'Grounded QA Chat', desc: 'Ask questions about any paper — every answer cites the exact source page.' },
  { icon: <FiBookOpen />, label: 'Literature Reviews', desc: 'One-click comparative synthesis across multiple uploaded documents.' },
  { icon: <FiZap />, label: 'Instant Insights', desc: 'From raw PDF to actionable insights in under 30 seconds.' },
  { icon: <FiAward />, label: 'Flashcards & Quizzes', desc: 'Auto-compiled learning cards to master the material faster.' },
];

/* ── Testimonials shown in the left panel ───── */
const TESTIMONIALS = [
  { text: 'ResearchMind cut my literature review time from 3 days to 3 hours.', author: 'Dr. Aisha K., Neuroscience, MIT' },
  { text: 'The grounded citations are a game-changer — zero hallucinations.', author: 'Prof. James R., Bioinformatics, Oxford' },
];

/* ════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════ */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = React.useContext(AuthContext);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // Rotate testimonials
  React.useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const onSubmit = async (data) => {
    setApiError('');
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Invalid credentials. Please try again.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-blue-50/30 font-sans relative overflow-x-hidden">
      <Navbar />
      <Background />

      <div className="flex-1 flex items-stretch z-10 relative">
        {/* ── LEFT INFO PANEL ──────────────────── */}
        <motion.aside
          className="hidden lg:flex flex-col justify-between w-[48%] xl:w-[45%] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white px-12 py-14 relative overflow-hidden"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 70 }}
        >
          {/* Decorative blobs inside panel */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />

          <div className="relative z-10 space-y-10">
            {/* Header */}
            <div className="space-y-3">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-extrabold uppercase tracking-widest"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <FiCpu size={10} className="animate-spin" style={{ animationDuration: '5s' }} />
                AI Research Workspace
              </motion.div>
              <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight">
                Supercharge your research with AI
              </h2>
              <p className="text-white/70 text-sm leading-relaxed font-medium max-w-sm">
                Join thousands of researchers who use ResearchMind AI to parse literature, extract insights, and draft publications — all in minutes.
              </p>
            </div>

            {/* Feature list */}
            <ul className="space-y-5">
              {INFO_FEATURES.map((f, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 text-white/90 mt-0.5">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{f.label}</p>
                    <p className="text-white/60 text-[11px] font-medium leading-relaxed mt-0.5">{f.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Rotating Testimonial */}
          <div className="relative z-10 mt-10">
            <div className="bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-white/90 text-sm font-medium leading-relaxed italic">
                    "{TESTIMONIALS[testimonialIdx].text}"
                  </p>
                  <p className="text-white/50 text-[10px] font-bold mt-2 uppercase tracking-wider">
                    — {TESTIMONIALS[testimonialIdx].author}
                  </p>
                </motion.div>
              </AnimatePresence>
              <div className="flex gap-1.5 mt-3">
                {TESTIMONIALS.map((_, i) => (
                  <div key={i} className={`h-0.5 rounded-full transition-all duration-300 ${i === testimonialIdx ? 'bg-white w-5' : 'bg-white/30 w-2'}`} />
                ))}
              </div>
            </div>
            <p className="text-white/40 text-[10px] font-bold mt-4 uppercase tracking-widest text-center">
              🔒 End-to-end encrypted · GDPR compliant
            </p>
          </div>
        </motion.aside>

        {/* ── RIGHT FORM PANEL ─────────────────── */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
          <motion.div
            className="w-full max-w-md space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {/* Card */}
            <div className="bg-white/90 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/50 p-8 space-y-7 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

              {/* Header */}
              <div className="text-center space-y-3">
                <motion.div
                  className="w-13 h-13 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: 52, height: 52 }}
                >
                  <FiCpu size={22} />
                </motion.div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
                <p className="text-xs text-slate-400 font-medium">Sign in to your research workspace</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FancyInput
                  label="Email Address" icon={FiMail} type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' }
                  })}
                />
                <FancyInput
                  label="Password" icon={FiLock} type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' }
                  })}
                />

                <div className="flex items-center justify-between text-xs">
                  <span />
                  <Link to="/forgot-password" className="text-blue-600 hover:underline font-semibold">
                    Forgot password?
                  </Link>
                </div>

                <AnimatePresence>
                  {apiError && (
                    <motion.div
                      className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-xs font-medium"
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    >
                      <FiShield size={13} className="text-red-400 flex-shrink-0" /> {apiError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit" disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                >
                  {isLoading ? (
                    <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                  ) : (
                    <>Sign In <FiArrowRight size={13} /></>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">New here?</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Register CTA */}
              <Link
                to="/register"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors duration-200"
              >
                Create a free account <FiArrowRight size={12} />
              </Link>
            </div>

            {/* Trust */}
            <p className="text-center text-[10px] text-slate-400 font-medium">
              🔒 Encrypted · Zero data retention · GDPR compliant
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
