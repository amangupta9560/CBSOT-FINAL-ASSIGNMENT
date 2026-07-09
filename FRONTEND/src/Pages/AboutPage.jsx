import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useInView } from 'framer-motion';
import { FiGlobe, FiCpu } from 'react-icons/fi';
import Navbar from '../Components/Common/Navbar.jsx';
import Footer from '../Components/Common/Footer.jsx';

/* ─────────────────────────────────────────────
   SCRAMBLE TEXT HOOK
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
   STAT ITEM — count-up on scroll
───────────────────────────────────────────── */
const StatItem = ({ num, suffix, prefix = '', label, gradient }) => {
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
      className="text-center group cursor-default p-6 rounded-3xl bg-white border border-slate-100 shadow-md hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
      whileHover={{ y: -6, scale: 1.03 }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <motion.div
        className={`text-4xl sm:text-5xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
        whileHover={{ scale: 1.15, rotate: [-1, 1, -1, 0] }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        {prefix}{count}{suffix}
      </motion.div>
      <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest mt-2">{label}</p>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   DRAGGABLE AGENT CARD  (3-D tilt + drag)
───────────────────────────────────────────── */
const AgentCard = ({ agent, index }) => {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useTransform(my, [-50, 50], [10, -10]);
  const rotY = useTransform(mx, [-50, 50], [-10, 10]);
  const srotX = useSpring(rotX, { stiffness: 200, damping: 25 });
  const srotY = useSpring(rotY, { stiffness: 200, damping: 25 });

  return (
    <motion.div
      drag
      dragElastic={0.1}
      dragMomentum={true}
      whileDrag={{ scale: 1.08, zIndex: 999, cursor: 'grabbing', boxShadow: '0 30px 60px rgba(99,102,241,0.2)' }}
      style={{ rotateX: srotX, rotateY: srotY, transformStyle: 'preserve-3d', cursor: 'grab' }}
      animate={{ y: [0, -7, 0] }}
      transition={{ y: { duration: 4 + index * 0.3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 } }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - rect.left - rect.width / 2);
        my.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      // stagger via transition delay
      className="bg-white border border-slate-100 p-6 rounded-3xl group hover:border-blue-300/30 hover:shadow-xl hover:shadow-blue-500/8 transition-shadow duration-300 select-none relative overflow-hidden"
    >
      {/* Glimmer inner bg */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/20 transition-all duration-500 pointer-events-none" />

      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl shadow-sm"
            whileHover={{ rotate: [0, -12, 12, 0], scale: 1.12 }}
            transition={{ duration: 0.4 }}
          >
            {agent.icon}
          </motion.div>
          <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
            ⠿ Drag
          </span>
        </div>

        <h3 className="text-sm font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors duration-300">
          {agent.name}
        </h3>
        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{agent.role}</p>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   ABOUT PAGE
───────────────────────────────────────────── */
const AboutPage = () => {
  const { display: heroText, scramble: triggerScramble } = useScramble('AI-Augmented Research');

  const agents = [
    { name: 'Ingestion & Parser Agent', role: 'Converts complex PDF layouts and extracts structured text, tables, and mathematical formulas.', icon: '📑' },
    { name: 'Keywords Agent',          role: 'Builds cross-referenced tags and categorizations for fast discoverability across papers.', icon: '🏷️' },
    { name: 'Summary Agent',           role: 'Synthesizes dual-level summaries tailored to both non-technical and scientific readers.', icon: '📝' },
    { name: 'Mind Map Builder Agent',  role: 'Delineates hierarchical branches of the research paper into a custom knowledge tree.', icon: '🗺️' },
    { name: 'Citation Agent',          role: 'Extracts bibliography and formats into APA, IEEE, MLA, and BibTeX standards.', icon: '📖' },
    { name: 'Research Gap Agent',      role: 'Systematically assesses limitations and highlights unexplored boundaries in the literature.', icon: '🔍' },
    { name: 'Experiment Architect',    role: 'Outlines actionable research experiments and methodologies to address identified findings.', icon: '🧪' },
    { name: 'Writing Assistant Agent', role: 'Drafts slide decks, patents, and grant applications grounded directly in the paper context.', icon: '✍️' },
  ];

  const particlePositions = [
    { l: '8%',  t: '10%', delay: '0s',   s: 8  },
    { l: '88%', t: '30%', delay: '2s',   s: 10 },
    { l: '20%', t: '70%', delay: '4s',   s: 6  },
    { l: '75%', t: '78%', delay: '1s',   s: 9  },
    { l: '50%', t: '5%',  delay: '3.5s', s: 7  },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-blue-50/30 text-slate-800 font-sans overflow-x-hidden relative">
      <Navbar />

      {/* ── BACKGROUND EFFECTS ─────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Floating rays */}
        <div className="absolute -top-40 right-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-blue-100/40 to-indigo-100/20 rounded-full blur-[160px] animate-ray-1" />
        <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-purple-100/35 to-pink-100/20 rounded-full blur-[140px] animate-ray-2" />
        {/* Morphing blob */}
        <div className="absolute top-[25%] left-[4%] w-[320px] h-[320px] bg-indigo-100/30 blur-[90px] animate-morph" />
        {/* Floating geometric shapes */}
        {[
          { w: 80, color: 'bg-blue-200/25',   x: '5%',  y: '12%', dur: 7  },
          { w: 55, color: 'bg-purple-200/20',  x: '91%', y: '22%', dur: 9  },
          { w: 40, color: 'bg-indigo-200/25',  x: '80%', y: '60%', dur: 6  },
          { w: 45, color: 'bg-cyan-200/20',    x: '15%', y: '80%', dur: 8  },
          { w: 30, color: 'bg-violet-200/30',  x: '50%', y: '90%', dur: 5  },
        ].map((s, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: s.x, top: s.y }}
            animate={{ y: [-15, 15, -15], rotate: [0, 180, 360], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: s.dur, delay: i * 0.7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className={`${s.color} rounded-full blur-sm`} style={{ width: s.w, height: s.w }} />
          </motion.div>
        ))}
        {/* Particles */}
        {particlePositions.map((p, i) => (
          <motion.div
            key={`pp${i}`}
            className="absolute rounded-full bg-blue-400/25"
            style={{ width: p.s, height: p.s, left: p.l, top: p.t }}
            animate={{ y: [0, -160, -300], opacity: [0.3, 0.7, 0], scale: [1, 1.4, 0.4] }}
            transition={{ duration: 10 + i, delay: parseFloat(p.delay), repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
        {/* Bottom wave divider */}
        <svg className="absolute bottom-0 left-0 w-full h-12 text-slate-50/80 pointer-events-none" viewBox="0 0 1440 48" preserveAspectRatio="none">
          <path d="M0,24L360,12C720,0,1080,0,1260,12L1440,24L1440,48L1260,48C1080,48,720,48,360,48L0,48Z" fill="currentColor" />
        </svg>
      </div>

      {/* ── HERO BANNER ────────────────────────── */}
      <section className="relative py-24 md:py-32 border-b border-slate-100/60 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-600 border border-blue-100"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 250 }}
            whileHover={{ scale: 1.06, rotate: [-1, 1, 0] }}
          >
            Our Mission & Vision
          </motion.span>

          {/* SCRAMBLE HEADLINE */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight cursor-pointer select-none"
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            onHoverStart={triggerScramble}
            title="Hover to scramble!"
          >
            Pioneering the Next Era of{' '}
            <br className="hidden md:inline" />
            <span className="shimmer-text font-mono">{heroText}</span>
          </motion.h1>

          <motion.p
            className="max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-slate-500 leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            We construct intelligent collaborative workflows that coordinate autonomous AI workforces, helping researchers parse, comprehend, and synthesize literature in minutes.
          </motion.p>
        </div>
      </section>

      {/* ── PHILOSOPHY + STATS ─────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Philosophy text */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, type: 'spring', stiffness: 70 }}
          >
            {/* BUZZ heading */}
            <motion.h2
              className="text-3xl font-extrabold text-slate-950 tracking-tight sm:text-4xl cursor-pointer"
              whileHover={{ x: [0, -5, 5, -4, 4, -2, 2, 0] }}
              transition={{ duration: 0.5 }}
            >
              Why We Built ResearchMind AI
            </motion.h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              Scientific knowledge is expanding exponentially, but the tools researchers use to ingest, filter, and extract value from academic papers have remained stagnant. Scientists and students spend hours parsing layouts, searching for citations, and rewriting literature reviews.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              ResearchMind AI solves this bottleneck by orchestrating a coordinate network of 14 autonomous agents in a stateful LangGraph pipeline, enabling deep semantic interrogation with absolute grounding and zero hallucinations.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              {[
                { icon: <FiGlobe />, color: 'text-blue-600', label: 'Grounded QA', desc: 'Every answer is strictly mapped to source pages via vector databases.' },
                { icon: <FiCpu />,   color: 'text-purple-600', label: 'Stateful Graphs', desc: 'Advanced LangGraph systems coordinate agents sequentially.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors"
                  whileHover={{ scale: 1.04, y: -3 }}
                >
                  <div className={`flex items-center gap-2 ${item.color} font-bold text-sm`}>
                    {item.icon} {item.label}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Count-up stats grid */}
          <motion.div
            className="grid grid-cols-2 gap-5"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, type: 'spring', stiffness: 70 }}
          >
            <StatItem num={14}  suffix="+"  label="Collaborative Agents" gradient="from-blue-600 to-indigo-600"   />
            <StatItem num={100} suffix="%" label="Fact Grounding"        gradient="from-indigo-600 to-purple-600" />
            <StatItem num={30}  suffix="s"  prefix="<" label="Analysis Time" gradient="from-purple-600 to-pink-600" />
            <StatItem num={500} suffix="k+" label="Papers Ingested"      gradient="from-pink-600 to-blue-600"     />
          </motion.div>
        </div>
      </section>

      {/* ── AGENT FLEET — Draggable Cards ──────── */}
      <section className="py-24 bg-slate-50 border-y border-slate-100 z-10 relative overflow-hidden">
        {/* SVG wave top */}
        <svg className="absolute top-0 left-0 w-full h-10 text-white pointer-events-none" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,20L360,8C720,0,1080,0,1260,8L1440,20L1440,0L1260,0C1080,0,720,0,360,0L0,0Z" fill="currentColor" />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <motion.span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-purple-50 text-purple-600 border border-purple-100"
              whileHover={{ rotate: [0, -4, 4, 0], scale: 1.06 }}
              transition={{ duration: 0.4 }}
            >
              The Engine Room
            </motion.span>

            {/* TILTING heading */}
            <motion.h2
              className="text-3xl font-extrabold text-slate-950 tracking-tight sm:text-4xl cursor-pointer"
              whileHover={{
                scale: 1.02,
                rotate: [-0.5, 0.5, -0.5, 0],
                textShadow: '0 4px 16px rgba(99,102,241,0.15)'
              }}
              transition={{ duration: 0.5 }}
            >
              Meet our Autonomous Workforce
            </motion.h2>

            <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
              🖱️ <strong>Drag any agent card</strong> around the page · Hover to feel the 3-D tilt
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent, idx) => (
              <AgentCard key={idx} agent={agent} index={idx} />
            ))}
          </div>
        </div>

        {/* SVG wave bottom */}
        <svg className="absolute bottom-0 left-0 w-full h-10 text-white pointer-events-none" viewBox="0 0 1440 40" preserveAspectRatio="none">
          <path d="M0,20L360,32C720,40,1080,40,1260,32L1440,20L1440,40L1260,40C1080,40,720,40,360,40L0,40Z" fill="currentColor" />
        </svg>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
