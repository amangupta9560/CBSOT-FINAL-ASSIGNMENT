import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiArrowLeft, FiRefreshCw, FiCheckCircle, FiClock } from 'react-icons/fi';
import api from '../Utils/api';
import useAuth from '../Hooks/useAuth';
import Toast from '../Components/Common/Toast.jsx';
import Navbar from '../Components/Common/Navbar.jsx';

/* ── Floating background ─────────────────────── */
const Background = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute -top-40 right-1/3 w-[700px] h-[700px] bg-gradient-to-tr from-blue-100/40 to-indigo-100/20 rounded-full blur-[160px] animate-ray-1" />
    <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-violet-100/30 to-pink-100/20 rounded-full blur-[140px] animate-ray-2" />
    <div className="absolute top-[30%] left-[5%] w-[260px] h-[260px] bg-indigo-100/25 blur-[80px] animate-morph" />

    {/* Floating shapes */}
    {[
      { w: 70, color: 'bg-blue-200/20',   x: '6%',  y: '12%', dur: 7 },
      { w: 55, color: 'bg-indigo-200/15', x: '88%', y: '18%', dur: 9 },
      { w: 40, color: 'bg-purple-200/20', x: '82%', y: '68%', dur: 6 },
      { w: 35, color: 'bg-cyan-200/15',   x: '14%', y: '72%', dur: 8 },
      { w: 50, color: 'bg-violet-200/15', x: '50%', y: '5%',  dur: 10},
    ].map((s, i) => (
      <motion.div key={i} className="absolute" style={{ left: s.x, top: s.y }}
        animate={{ y: [-15, 15, -15], rotate: [0, 180, 360], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: s.dur, delay: i * 0.7, repeat: Infinity, ease: 'easeInOut' }}>
        <div className={`${s.color} rounded-full blur-sm`} style={{ width: s.w, height: s.w }} />
      </motion.div>
    ))}

    {/* Rising particles */}
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div key={`p${i}`}
        className="absolute rounded-full bg-blue-400/20"
        style={{ width: 4 + i % 3 * 3, height: 4 + i % 3 * 3, left: `${10 + i * 11}%`, top: `${38 + i % 4 * 13}%` }}
        animate={{ y: [0, -140, -280], opacity: [0.3, 0.6, 0], scale: [1, 1.3, 0.4] }}
        transition={{ duration: 9 + i, delay: i * 1.2, repeat: Infinity, ease: 'easeOut' }} />
    ))}
  </div>
);

/* ── Single OTP digit box ────────────────────── */
const OtpBox = ({ value, index, filled, inputRef, onChange, onKeyDown, onPaste, onFocus }) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, scale: 0.6, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay: 0.4 + index * 0.07, type: 'spring', stiffness: 200, damping: 18 }}
    whileHover={{ scale: 1.06, y: -3 }}
    className="relative"
  >
    {/* Glow ring when filled */}
    {filled && (
      <motion.div
        className="absolute inset-0 rounded-2xl bg-blue-500/10 ring-2 ring-blue-500/30 pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      />
    )}
    <input
      type="text"
      inputMode="numeric"
      maxLength="1"
      ref={inputRef}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onFocus={onFocus}
      className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black border-2 rounded-2xl focus:outline-none transition-all duration-200 bg-white/80 cursor-text select-none ${
        filled
          ? 'border-blue-500 text-blue-600 shadow-md shadow-blue-500/10 bg-blue-50/60'
          : 'border-slate-200 text-slate-800 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15'
      }`}
    />
  </motion.div>
);

/* ── Circular countdown progress ring ───────── */
const CountdownRing = ({ timeLeft, totalTime }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / totalTime;
  const strokeDash = circumference * progress;
  const isUrgent = timeLeft <= 60;

  return (
    <div className="relative w-20 h-20 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} stroke="#e2e8f0" strokeWidth="6" fill="none" />
        <motion.circle
          cx="40" cy="40" r={radius}
          stroke={isUrgent ? '#ef4444' : '#3b82f6'}
          strokeWidth="6" fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - strokeDash}
          animate={{ stroke: isUrgent ? '#ef4444' : '#3b82f6' }}
          transition={{ duration: 0.5 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-sm font-black ${isUrgent ? 'text-red-500' : 'text-slate-700'}`}>
          {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
        </span>
        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">left</span>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   OTP PAGE
═══════════════════════════════════════════ */
const OTPPage = () => {
  const TOTAL_TIME = 600; // 10 minutes
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [resendTimer, setResendTimer] = useState(60);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [shake, setShake] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const inputsRef = useRef([]);

  const userId = location.state?.userId;
  const email = location.state?.email || 'your email';

  // Redirect if no userId
  useEffect(() => {
    if (!userId) {
      setToast({ message: 'Session missing — redirecting...', type: 'error' });
      setTimeout(() => navigate('/register'), 2000);
    }
  }, [userId, navigate]);

  // Main countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  // Resend cooldown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const handleChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value !== '' && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index] === '' && index > 0) {
        inputsRef.current[index - 1]?.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length) {
      const arr = text.split('');
      const newOtp = [...otp];
      arr.forEach((ch, i) => { if (i < 6) newOtp[i] = ch; });
      setOtp(newOtp);
      const focusIdx = Math.min(arr.length, 5);
      inputsRef.current[focusIdx]?.focus();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/resend-otp', { userId });
      if (res.data?.success) {
        setToast({ message: 'New OTP sent to your email!', type: 'success' });
        setResendTimer(60);
        setTimeLeft(TOTAL_TIME);
        setOtp(new Array(6).fill(''));
        inputsRef.current[0]?.focus();
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      triggerShake();
      setToast({ message: 'Please enter all 6 digits', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { userId, otp: otpCode });
      if (res.data?.success) {
        setVerified(true);
        setTimeout(() => login(res.data.token, res.data.user), 1600);
      }
    } catch (err) {
      triggerShake();
      setToast({ message: err.response?.data?.message || 'Invalid OTP. Try again.', type: 'error' });
      setOtp(new Array(6).fill(''));
      inputsRef.current[0]?.focus();
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
        <AnimatePresence mode="wait">

          {/* ── SUCCESS STATE ───────────────────── */}
          {verified ? (
            <motion.div
              key="success"
              className="text-center space-y-6 max-w-sm mx-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 150, damping: 18 }}
            >
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30"
                animate={{ scale: [1, 1.15, 1], rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.7 }}
              >
                <FiCheckCircle size={42} />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Email Verified!</h2>
                <p className="text-sm text-slate-500 font-medium">Taking you to your dashboard…</p>
              </div>
              <div className="flex justify-center gap-1.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-emerald-500"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ delay: i * 0.08, duration: 0.5, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (

            /* ── MAIN OTP CARD ──────────────────── */
            <motion.div
              key="otpForm"
              className="w-full max-w-md"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
            >
              <div className="bg-white/90 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden">
                {/* Rainbow top bar */}
                <div className="h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                <div className="p-8 sm:p-10 space-y-8">
                  {/* Back button */}
                  <motion.button
                    onClick={() => navigate('/register')}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-wider"
                    whileHover={{ x: -3 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <FiArrowLeft size={14} /> Back to Register
                  </motion.button>

                  {/* Header */}
                  <div className="text-center space-y-5">
                    {/* Animated envelope icon */}
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25"
                      animate={{
                        rotate: [0, -8, 8, -5, 5, 0],
                        y: [0, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <FiMail size={28} />
                    </motion.div>

                    <div className="space-y-2">
                      <motion.h1
                        className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        Check your inbox
                      </motion.h1>
                      <motion.p
                        className="text-sm text-slate-500 font-medium leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        We sent a 6-digit verification code to
                        <br />
                        <span className="font-black text-slate-900 text-base">{email}</span>
                      </motion.p>
                    </div>

                    {/* Countdown ring */}
                    <CountdownRing timeLeft={timeLeft} totalTime={TOTAL_TIME} />

                    {timeLeft <= 0 && (
                      <motion.p
                        className="text-xs text-red-500 font-bold"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      >
                        Code expired — please request a new one.
                      </motion.p>
                    )}
                  </div>

                  {/* OTP input boxes */}
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <motion.div
                      className="flex justify-center gap-2 sm:gap-3"
                      animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {otp.map((digit, index) => (
                        <OtpBox
                          key={index}
                          value={digit}
                          index={index}
                          filled={digit !== ''}
                          inputRef={(el) => (inputsRef.current[index] = el)}
                          onChange={(e) => handleChange(e.target, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          onPaste={handlePaste}
                          onFocus={(e) => e.target.select()}
                        />
                      ))}
                    </motion.div>

                    {/* Resend row */}
                    <div className="flex flex-col items-center gap-2 text-xs text-slate-400 font-medium">
                      <span>Didn't receive the code?</span>
                      {resendTimer > 0 ? (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <FiClock size={11} />
                          <span>Resend in <strong className="text-slate-700">{resendTimer}s</strong></span>
                        </div>
                      ) : (
                        <motion.button
                          type="button"
                          onClick={handleResend}
                          disabled={loading}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-500 font-bold hover:underline disabled:opacity-50 transition-colors"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          <FiRefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                          Resend verification code
                        </motion.button>
                      )}
                    </div>

                    {/* Submit button */}
                    <motion.button
                      type="submit"
                      disabled={loading || timeLeft <= 0}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {loading ? (
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                        />
                      ) : (
                        <>Verify & Continue</>
                      )}
                    </motion.button>
                  </form>

                  {/* Footer hint */}
                  <p className="text-center text-[10px] text-slate-400 font-medium">
                    Check spam if you don't see it · Code valid for 10 minutes
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OTPPage;
