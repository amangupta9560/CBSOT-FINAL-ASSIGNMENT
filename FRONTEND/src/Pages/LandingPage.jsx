import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  motion, useMotionValue, useTransform, useSpring, useInView, AnimatePresence
} from 'framer-motion';
import {
  FiUploadCloud, FiCpu, FiMessageSquare, FiBookOpen,
  FiFileText, FiAward, FiArrowRight, FiZap
} from 'react-icons/fi';
import Navbar from '../Components/Common/Navbar.jsx';
import Footer from '../Components/Common/Footer.jsx';

/* ─────────────────────────────────────────────
   SCRAMBLE TEXT HOOK
   Randomly jumbles characters then resolves to
   the real text on mount / on hover trigger.
───────────────────────────────────────────── */
const useScramble = (originalText) => {
  const CHARS = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const [display, setDisplay] = useState(originalText);
  const timerRef = useRef(null);

  const scramble = useCallback(() => {
    clearInterval(timerRef.current);
    let iteration = 0;
    timerRef.current = setInterval(() => {
      setDisplay(
        originalText.split('').map((char, idx) => {
          if (char === ' ') return ' ';
          if (idx < Math.floor(iteration)) return originalText[idx];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('')
      );
      iteration += 0.45;
      if (iteration >= originalText.length) {
        clearInterval(timerRef.current);
        setDisplay(originalText);
      }
    }, 28);
  }, [originalText]);

  useEffect(() => {
    scramble();
    return () => clearInterval(timerRef.current);
  }, [scramble]);

  return { display, scramble };
};

/* ─────────────────────────────────────────────
   STAT ITEM  (count-up animation on scroll)
───────────────────────────────────────────── */
const StatItem = ({ num, suffix, prefix = '', label, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(num / 45));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(start);
    }, 28);
    return () => clearInterval(timer);
  }, [inView, num]);

  return (
    <motion.div
      ref={ref}
      className="text-center group cursor-default"
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 80 }}
    >
      <motion.div
        className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        whileHover={{ scale: 1.18, rotate: [-1, 1, -1, 0] }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        {prefix}{count}{suffix}
      </motion.div>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{label}</p>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   3-D TILT + DRAG CARD
   Cards float when idle, tilt on mouse move,
   and are freely draggable around the page.
───────────────────────────────────────────── */
const TiltDragCard = ({ children, className, floatDelay = 0 }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useTransform(y, [-60, 60], [12, -12]);
  const rotY = useTransform(x, [-60, 60], [-12, 12]);
  const springRotX = useSpring(rotX, { stiffness: 200, damping: 25 });
  const springRotY = useSpring(rotY, { stiffness: 200, damping: 25 });

  return (
    <motion.div
      drag
      dragElastic={0.12}
      dragMomentum={true}
      whileDrag={{ scale: 1.07, zIndex: 999, cursor: 'grabbing', boxShadow: '0 30px 60px rgba(59,130,246,0.2)' }}
      style={{
        rotateX: springRotX,
        rotateY: springRotY,
        transformStyle: 'preserve-3d',
        cursor: 'grab'
      }}
      animate={{ y: [0, -8, 0] }}
      transition={{
        y: { duration: 3.5 + floatDelay * 0.4, repeat: Infinity, ease: 'easeInOut', delay: floatDelay * 0.5 }
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   BACKGROUND — Floating geometric shapes,
   orbs, particles, rays, morphing blobs, waves
───────────────────────────────────────────── */
const Background = () => {
  const shapes = [
    { type: 'circle',  w: 90,  color: 'bg-blue-200/30',   x: '4%',  y: '8%',  dur: 7,  delay: 0   },
    { type: 'square',  w: 55,  color: 'bg-indigo-200/20',  x: '88%', y: '15%', dur: 9,  delay: 1   },
    { type: 'circle',  w: 40,  color: 'bg-purple-200/25',  x: '78%', y: '65%', dur: 6,  delay: 2.5 },
    { type: 'square',  w: 50,  color: 'bg-sky-200/25',     x: '55%', y: '3%',  dur: 8,  delay: 1.5 },
    { type: 'circle',  w: 30,  color: 'bg-violet-200/30',  x: '20%', y: '75%', dur: 5,  delay: 3   },
    { type: 'square',  w: 35,  color: 'bg-cyan-200/20',    x: '40%', y: '88%', dur: 10, delay: 0.8 },
    { type: 'diamond', w: 45,  color: 'bg-indigo-300/15',  x: '92%', y: '50%', dur: 7,  delay: 2   },
    { type: 'diamond', w: 35,  color: 'bg-blue-300/20',    x: '10%', y: '45%', dur: 8,  delay: 4   },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Big floating rays */}
      <div className="absolute -top-40 right-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-blue-100/50 to-indigo-100/25 rounded-full blur-[160px] animate-ray-1" />
      <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-purple-100/40 to-pink-100/25 rounded-full blur-[140px] animate-ray-2" />
      <div className="absolute top-1/3 left-[2%] w-[350px] h-[350px] bg-indigo-100/30 blur-[90px] animate-morph" />

      {/* Geometric floating shapes */}
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: s.x, top: s.y }}
          animate={{ y: [-18, 18, -18], rotate: [0, s.type === 'diamond' ? 45 : 180, 0], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          {s.type === 'circle' && <div className={`${s.color} rounded-full blur-sm`} style={{ width: s.w, height: s.w }} />}
          {s.type === 'square' && <div className={`${s.color} rounded-xl blur-sm`} style={{ width: s.w, height: s.w }} />}
          {s.type === 'diamond' && (
            <div className={`${s.color} blur-sm`} style={{ width: s.w, height: s.w, transform: 'rotate(45deg)', borderRadius: '6px' }} />
          )}
        </motion.div>
      ))}

      {/* Drifting dot particles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={`p${i}`}
          className="absolute rounded-full bg-blue-400/25"
          style={{
            width: 4 + (i % 3) * 3,
            height: 4 + (i % 3) * 3,
            left: `${8 + i * 9}%`,
            top: `${30 + (i % 4) * 15}%`
          }}
          animate={{
            y: [0, -160, -300],
            opacity: [0.3, 0.7, 0],
            scale: [1, 1.4, 0.4]
          }}
          transition={{ duration: 9 + i * 0.8, delay: i * 1.2, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}

      {/* SVG Wave at bottom of hero */}
      <svg className="absolute bottom-0 left-0 w-full h-16 text-white/60 pointer-events-none" viewBox="0 0 1440 64" preserveAspectRatio="none">
        <path d="M0,32L120,26.7C240,21,480,11,720,16C960,21,1200,43,1320,53.3L1440,64L1440,64L1320,64C1200,64,960,64,720,64C480,64,240,64,120,64L0,64Z" fill="currentColor" />
      </svg>
    </div>
  );
};

/* ─────────────────────────────────────────────
   LANDING PAGE
───────────────────────────────────────────── */
const LandingPage = () => {
  const { display: heroText, scramble: triggerScramble } = useScramble('Analyze Research Papers');

  const features = [
    { icon: '📄', title: 'Smart PDF Ingestion',    desc: 'Upload papers up to 25MB. Autodetect captions, equations, tables, and sections.', grad: 'from-blue-50 to-indigo-50',   border: 'border-blue-100/60' },
    { icon: '🤖', title: '14 Autonomous Agents',   desc: 'Stateful LangGraph workflows cross-verify findings and extract research gaps.',   grad: 'from-purple-50 to-pink-50',  border: 'border-purple-100/60' },
    { icon: '💬', title: 'Grounded QA Chat',        desc: 'Talk to your literature. Every answer verified with exact page citations.',         grad: 'from-emerald-50 to-teal-50', border: 'border-emerald-100/60' },
    { icon: '📚', title: 'Literature Reviews',      desc: 'Select multiple papers on your dashboard and synthesize reviews in one click.',     grad: 'from-amber-50 to-orange-50', border: 'border-amber-100/60' },
    { icon: '✍️',  title: 'Writing Assistant',      desc: 'Auto-draft patents, slides, and grant proposals grounded in your documents.',       grad: 'from-rose-50 to-red-50',     border: 'border-rose-100/60' },
    { icon: '🎯', title: 'Flashcards & Quizzes',   desc: 'Auto-compile 20 learning cards and structured comprehension quizzes per paper.',    grad: 'from-cyan-50 to-sky-50',     border: 'border-cyan-100/60' },
  ];

  const steps = [
    { num: '1', title: 'Upload Documents',   desc: 'Securely upload PDFs up to 25 MB. Custom parsers isolate figures, tables, and text blocks.' },
    { num: '2', title: 'Graph Run Ingest',   desc: '14 agents run concurrently in a LangGraph structure, verifying every claim against the source.' },
    { num: '3', title: 'Synthesize & Export', desc: 'Chat grounded in your papers, build flashcard decks, compile reviews, and export drafts.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-blue-50/30 text-slate-800 font-sans overflow-x-hidden relative">
      <Navbar />
      <Background />

      {/* ── HERO ─────────────────────────────── */}
      <section className="relative py-20 lg:py-36 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">

          {/* Animated Badge */}
          <motion.span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-600 border border-blue-100 cursor-pointer select-none"
            initial={{ opacity: 0, scale: 0.75, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 250, delay: 0.1 }}
            whileHover={{ scale: 1.08, rotate: [-1, 1, -1, 0] }}
            whileTap={{ scale: 0.92 }}
          >
            <FiCpu size={11} className="animate-spin" style={{ animationDuration: '5s' }} />
            The Collaborative Multi-Agent Workspace
          </motion.span>

          {/* SCRAMBLE HEADLINE — hover to re-scramble */}
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-tight cursor-pointer select-none"
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            onHoverStart={triggerScramble}
            title="Hover to scramble!"
          >
            <span className="font-mono">{heroText}</span>
            <br className="hidden md:inline" />
            <span className="shimmer-text">With Multi-Agent Autonomy</span>
          </motion.h1>

          {/* Sub-text with word-by-word stagger */}
          <motion.p
            className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-slate-500 leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            ResearchMind AI deploys 14 specialized, stateful AI agents working collaboratively to parse metadata, extract visuals, map knowledge branches, and draft publication-grade literature reviews.
          </motion.p>

          {/* CTA BUTTONS */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
          >
            {/* Primary — pulsing glow + buzz on hover */}
            <motion.div
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.96, rotate: -1 }}
              className="animate-pulse-glow rounded-xl"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20 transition-colors duration-200"
              >
                <FiZap size={14} /> Get Started Free
              </Link>
            </motion.div>

            {/* Secondary */}
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-slate-200 text-sm font-bold uppercase tracking-wider rounded-xl text-slate-600 bg-white hover:bg-slate-50 shadow-sm transition-all duration-200"
              >
                Explore Features <FiArrowRight size={13} />
              </a>
            </motion.div>
          </motion.div>

          {/* PIPELINE MOCKUP — tilts on hover */}
          <motion.div
            className="mt-16 max-w-5xl mx-auto rounded-3xl border border-slate-100 bg-white/95 p-4 sm:p-5 shadow-2xl shadow-slate-200/60 relative"
            initial={{ opacity: 0, y: 55, rotateX: 12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.95, delay: 0.7, type: 'spring', stiffness: 70 }}
            whileHover={{ scale: 1.015, rotateX: -3, rotateY: 2 }}
            style={{ perspective: 1200 }}
          >
            {/* Rainbow top border */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-3xl" />

            {/* Window chrome */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-[10px] text-slate-400 font-bold ml-2 font-mono">Multi-Agent State Pipeline</span>
              </div>
              <motion.span
                className="text-[9px] px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold uppercase tracking-widest border border-emerald-100"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ● Live
              </motion.span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left font-mono">
              {[
                { title: '1. Ingest Pipeline', items: [{ t: '✔ PDF parsed securely', c: 'text-green-600' }, { t: '✔ Keywords mapped (95%)', c: 'text-green-600' }, { t: '✔ Sections vectorized', c: 'text-green-600' }] },
                { title: '2. Agent Workforce',  items: [{ t: '● Summary Agent: active', c: 'text-blue-600' },   { t: '● Gap Analyzer: active', c: 'text-purple-600' }, { t: '● Experimenter: pending', c: 'text-indigo-600' }] },
                { title: '3. Outputs Synced',  items: [{ t: '✏ Mind map ready', c: 'text-slate-600' },          { t: '✏ Flashcards compiled', c: 'text-slate-600' },  { t: '✏ Grounded QA online', c: 'text-slate-600' }] },
              ].map((panel, pi) => (
                <div key={pi} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{panel.title}</span>
                  <div className="space-y-1.5">
                    {panel.items.map((it, ii) => (
                      <motion.p
                        key={ii}
                        className={`text-xs font-bold ${it.c}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: pi * 0.3 + ii * 0.15 + 1 }}
                      >
                        {it.t}
                      </motion.p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ROW ─────────────────────────── */}
      <section className="py-12 border-y border-slate-100 bg-white/80 z-10 relative">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem num={14}  suffix="+"  label="Collaborative Agents" delay={0}   />
          <StatItem num={100} suffix="%" label="Fact Grounding"        delay={0.1} />
          <StatItem num={30}  suffix="s"  prefix="<" label="Analysis Time" delay={0.2} />
          <StatItem num={500} suffix="k+" label="Papers Ingested"      delay={0.3} />
        </div>
      </section>

      {/* ── FEATURES — Draggable 3-D Tilt Cards ─ */}
      <section id="features" className="py-24 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <motion.span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-purple-50 text-purple-600 border border-purple-100 cursor-pointer"
              whileHover={{ rotate: [0, -4, 4, 0], scale: 1.06 }}
              transition={{ duration: 0.4 }}
            >
              Platform Capabilities
            </motion.span>

            {/* TILTING HEADING */}
            <motion.h2
              className="text-3xl font-black text-slate-950 tracking-tight sm:text-4xl cursor-pointer"
              whileHover={{
                scale: 1.02,
                rotate: [-0.5, 0.5, -0.5, 0],
                textShadow: '0 4px 16px rgba(99,102,241,0.15)'
              }}
              transition={{ duration: 0.5 }}
            >
              Engineered for Academic Workflows
            </motion.h2>
            <motion.p
              className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              🖱️ <strong>Drag any card</strong> anywhere on the page · Hover to feel the 3-D tilt
            </motion.p>
          </div>

          {/* Draggable feature cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {features.map((f, idx) => (
              <TiltDragCard
                key={idx}
                floatDelay={idx}
                className={`bg-gradient-to-br ${f.grad} border ${f.border} p-7 rounded-3xl group hover:shadow-2xl hover:shadow-blue-500/10 transition-shadow duration-300 select-none relative overflow-hidden`}
              >
                {/* Subtle inner glow on hover */}
                <div className="absolute inset-0 rounded-3xl bg-white/0 group-hover:bg-white/30 transition-all duration-300 pointer-events-none" />

                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <motion.div
                      className="w-12 h-12 rounded-2xl bg-white/80 border border-white shadow-sm flex items-center justify-center text-xl"
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                    >
                      {f.icon}
                    </motion.div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider bg-white/60 px-2 py-0.5 rounded-full border border-slate-100">
                      ⠿ Drag me
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors duration-300">
                    {f.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-xs font-medium">{f.desc}</p>
                </div>
              </TiltDragCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — Scroll-triggered steps ─ */}
      <section className="py-24 bg-slate-50 border-y border-slate-100 z-10 relative overflow-hidden">
        {/* Decorative wave divider top */}
        <svg className="absolute top-0 left-0 w-full h-10 text-white pointer-events-none" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,20L360,8C720,0,1080,0,1260,8L1440,20L1440,0L1260,0C1080,0,720,0,360,0L0,0Z" fill="currentColor" />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-teal-50 text-teal-600 border border-teal-100">
              Operations Flow
            </span>
            {/* BUZZ heading — shakes on hover */}
            <motion.h2
              className="text-3xl font-black text-slate-950 tracking-tight sm:text-4xl cursor-pointer"
              whileHover={{ x: [0, -5, 5, -4, 4, -2, 2, 0] }}
              transition={{ duration: 0.5 }}
            >
              From PDF to Insights in Seconds
            </motion.h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
              Stateful pipeline execution guarantees absolute alignment and grounded claims.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
            {/* Connecting lines (desktop) */}
            <div className="hidden md:block absolute top-6 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-300 to-blue-200 z-0" />

            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                className="flex flex-col items-center space-y-4 group relative z-10"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, type: 'spring', stiffness: 80 }}
              >
                {/* Spinning numbered circle */}
                <motion.div
                  className="w-14 h-14 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xl shadow-lg shadow-blue-500/20 relative"
                  whileHover={{ rotate: 360, scale: 1.15, backgroundColor: '#4f46e5' }}
                  transition={{ duration: 0.7, ease: 'easeInOut' }}
                >
                  {step.num}
                  {/* Ping ring */}
                  <span className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" style={{ animationDuration: '2s' }} />
                </motion.div>

                <motion.h3
                  className="text-base font-extrabold text-slate-900"
                  whileHover={{ color: '#2563eb', letterSpacing: '0.02em' }}
                  transition={{ duration: 0.25 }}
                >
                  {step.title}
                </motion.h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Decorative wave divider bottom */}
        <svg className="absolute bottom-0 left-0 w-full h-10 text-white pointer-events-none" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,20L360,32C720,40,1080,40,1260,32L1440,20L1440,40L1260,40C1080,40,720,40,360,40L0,40Z" fill="currentColor" />
        </svg>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
