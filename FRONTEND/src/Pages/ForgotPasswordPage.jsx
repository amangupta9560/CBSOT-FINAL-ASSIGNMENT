import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiArrowLeft, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import api from '../Utils/api';
import Toast from '../Components/Common/Toast.jsx';
import Navbar from '../Components/Common/Navbar.jsx';

/* ── Shared background ─────────────────────── */
const Background = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute -top-40 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/40 to-indigo-100/20 rounded-full blur-[160px] animate-ray-1" />
    <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-purple-100/30 to-pink-100/20 rounded-full blur-[140px] animate-ray-2" />
    <div className="absolute top-1/3 left-[4%] w-[240px] h-[240px] bg-indigo-100/25 blur-[80px] animate-morph" />
    {[
      { w: 70, color: 'bg-blue-200/20',   x: '5%',  y: '10%', dur: 7 },
      { w: 50, color: 'bg-purple-200/15', x: '87%', y: '18%', dur: 9 },
      { w: 35, color: 'bg-cyan-200/15',   x: '14%', y: '75%', dur: 8 },
    ].map((s, i) => (
      <motion.div key={i} className="absolute" style={{ left: s.x, top: s.y }}
        animate={{ y: [-14, 14, -14], rotate: [0, 180, 360], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: s.dur, delay: i * 0.9, repeat: Infinity, ease: 'easeInOut' }}>
        <div className={`${s.color} rounded-full blur-sm`} style={{ width: s.w, height: s.w }} />
      </motion.div>
    ))}
    {Array.from({ length: 6 }).map((_, i) => (
      <motion.div key={`p${i}`}
        className="absolute rounded-full bg-blue-400/20"
        style={{ width: 4 + i % 3 * 3, height: 4 + i % 3 * 3, left: `${12 + i * 14}%`, top: `${38 + i % 4 * 14}%` }}
        animate={{ y: [0, -130, -260], opacity: [0.3, 0.6, 0], scale: [1, 1.3, 0.4] }}
        transition={{ duration: 9 + i, delay: i * 1.3, repeat: Infinity, ease: 'easeOut' }} />
    ))}
  </div>
);

const ForgotPasswordPage = () => {
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [focused, setFocused] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSubmitted(true);
    } catch (error) {
      console.error('Reset request error:', error.message);
      // Still show success for security
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-blue-50/30 font-sans relative overflow-x-hidden">
      <Navbar />
      <Background />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex-1 flex items-center justify-center px-4 py-12 z-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
        >
          <div className="bg-white/90 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <div className="p-8 sm:p-10 space-y-8">
              {/* Back */}
              <motion.div whileHover={{ x: -3 }} transition={{ type: 'spring', stiffness: 400 }}>
                <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-wider">
                  <FiArrowLeft size={13} /> Back to Sign In
                </Link>
              </motion.div>

              <AnimatePresence mode="wait">
                {submitted ? (
                  /* ── SUCCESS STATE ─── */
                  <motion.div
                    key="success"
                    className="text-center space-y-6 py-4"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 150, damping: 18 }}
                  >
                    <motion.div
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25"
                      animate={{ scale: [1, 1.1, 1], rotate: [0, -8, 8, 0] }}
                      transition={{ duration: 0.7 }}
                    >
                      <FiCheckCircle size={30} />
                    </motion.div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-black text-slate-900">Check your inbox</h2>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        If that email exists in our system, you'll receive a reset link shortly. Also check your spam folder.
                      </p>
                    </div>
                    <motion.button
                      onClick={() => navigate('/login')}
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider"
                      whileHover={{ x: 3 }}
                    >
                      Return to Sign In <FiArrowRight size={12} />
                    </motion.button>
                  </motion.div>
                ) : (
                  /* ── FORM ─── */
                  <motion.div key="form" className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="text-center space-y-2">
                      <motion.div
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25"
                        animate={{ rotate: [0, -6, 6, 0] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <FiMail size={24} />
                      </motion.div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Forgot your password?</h1>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Enter your email and we'll send you a secure reset link.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Email Address</label>
                        <div className={`relative flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-all duration-300 ${
                          focused ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-sm' : errors.email ? 'border-red-300' : 'border-slate-200 hover:border-slate-300'
                        }`}>
                          <FiMail size={14} className={`flex-shrink-0 transition-colors ${focused ? 'text-blue-500' : 'text-slate-300'}`} />
                          <input
                            type="email"
                            placeholder="you@example.com"
                            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-300 focus:outline-none"
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            {...register('email', {
                              required: 'Email is required',
                              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                            })}
                          />
                        </div>
                        {errors.email && (
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                            className="text-[11px] text-red-500 font-medium">{errors.email.message}</motion.p>
                        )}
                      </div>

                      <motion.button
                        type="submit" disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 transition-colors duration-200 disabled:opacity-60"
                        whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                      >
                        {loading ? (
                          <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                        ) : (
                          <>Send Reset Link <FiArrowRight size={13} /></>
                        )}
                      </motion.button>
                    </form>

                    <p className="text-center text-xs text-slate-400 font-medium">
                      Remembered your password?{' '}
                      <Link to="/login" className="text-blue-600 hover:underline font-bold">Sign In</Link>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
