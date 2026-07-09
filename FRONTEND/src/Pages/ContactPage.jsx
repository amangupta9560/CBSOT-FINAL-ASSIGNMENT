import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiMessageSquare, FiSend, FiCheck, FiInfo } from 'react-icons/fi';
import Navbar from '../Components/Common/Navbar.jsx';
import Footer from '../Components/Common/Footer.jsx';

const ContactPage = () => {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setFormState({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring', bounce: 0.2 } }
  };

  const particleStyles = [
    { top: '10%', left: '15%', delay: '0s', size: 'w-2 h-2' },
    { top: '40%', left: '85%', delay: '3s', size: 'w-3 h-3' },
    { top: '70%', left: '25%', delay: '1s', size: 'w-1.5 h-1.5' },
    { top: '25%', left: '70%', delay: '5s', size: 'w-2.5 h-2.5' },
    { top: '80%', left: '80%', delay: '2s', size: 'w-2 h-2' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800 font-sans overflow-hidden relative">
      <Navbar />

      {/* BACKGROUND EFFECTS: Floating Rays, Morphing shapes, Particles & Waves */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Floating Ray 1 */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-blue-200/20 to-indigo-200/10 rounded-full blur-[120px] animate-ray-1"></div>
        {/* Floating Ray 2 */}
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-tr from-purple-200/20 to-pink-200/10 rounded-full blur-[120px] animate-ray-2"></div>
        
        {/* Morphing Shape in background */}
        <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] bg-blue-100/30 rounded-full blur-[80px] animate-morph"></div>
        
        {/* Particle Drift elements */}
        {particleStyles.map((p, idx) => (
          <div
            key={idx}
            className={`absolute ${p.size} bg-blue-400/20 rounded-full animate-particle`}
            style={{ top: p.top, left: p.left, animationDelay: p.delay }}
          ></div>
        ))}

        {/* SVG Waves at the bottom */}
        <svg className="absolute bottom-0 w-full h-24 text-slate-100/60 pointer-events-none" viewBox="0 0 1440 74" fill="none">
          <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,74L1320,74C1200,74,960,74,720,74C480,74,240,74,120,74L0,74Z" fill="currentColor"></path>
        </svg>
      </div>

      <section className="relative py-20 lg:py-28 z-10 flex-1 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          
          {/* Animated Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <motion.span 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-600 border border-blue-100 mb-2"
            >
              Connect With Us
            </motion.span>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight"
            >
              Get in Touch
            </motion.h1>
            <motion.p 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-lg mx-auto"
            >
              Have questions about ResearchMind AI? Reach out to our technical team for support, custom deployments, or corporate inquiries.
            </motion.p>
          </div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Info Cards Column */}
            <motion.div className="lg:col-span-5 flex flex-col gap-6" variants={itemVariants}>
              <motion.div 
                className="bg-white/80 border border-slate-100 p-8 rounded-3xl backdrop-blur-md space-y-6 flex-1 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300 group"
                whileHover={{ y: -6 }}
              >
                <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Contact Details</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  We aim to respond to all technical support tickets and integration queries within 24 business hours.
                </p>

                <div className="space-y-6 pt-4">
                  {[
                    { icon: <FiMail size={18} />, color: 'bg-blue-50 border-blue-100 text-blue-600', title: 'General Inquiries', detail: 'support@researchmind.ai' },
                    { icon: <FiMessageSquare size={18} />, color: 'bg-indigo-50 border-indigo-100 text-indigo-600', title: 'API Partnerships', detail: 'api@researchmind.ai' },
                    { icon: <FiMapPin size={18} />, color: 'bg-teal-50 border-teal-100 text-teal-600', title: 'Office Headquarters', detail: 'Silicon Valley Tech Hub, California, USA' }
                  ].map((card, cIdx) => (
                    <div key={cIdx} className="flex gap-4 items-start group/row">
                      <div className={`w-10 h-10 rounded-xl ${card.color} border flex items-center justify-center shrink-0 shadow-sm group-hover/row:scale-110 transition-transform duration-300`}>
                        {card.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{card.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{card.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Status Message Info Box */}
              <motion.div 
                className="bg-white/60 border border-slate-100 p-6 rounded-2xl flex items-center gap-3 shadow-md hover:border-blue-300/30 transition-all duration-300"
                whileHover={{ scale: 1.01 }}
              >
                <FiInfo className="text-blue-500 shrink-0" size={18} />
                <p className="text-[11px] text-slate-500 leading-normal font-medium">
                  Looking for custom on-premise installation? Drop us an email with your organization requirements.
                </p>
              </motion.div>
            </motion.div>

            {/* Interactive Message Form Card */}
            <motion.div className="lg:col-span-7" variants={itemVariants}>
              <motion.div 
                className="bg-white/80 border border-slate-100 p-8 sm:p-10 rounded-3xl backdrop-blur-md h-full shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300"
                whileHover={{ y: -4 }}
              >
                {submitted ? (
                  <motion.div 
                    className="flex flex-col items-center justify-center text-center h-full py-16 space-y-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-full flex items-center justify-center text-green-600 shadow-lg shadow-green-500/10">
                      <FiCheck size={28} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Message Transmitted!</h3>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-medium">
                      Thank you for contacting ResearchMind AI. A scientific support coordinator will follow up with you shortly.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="text-xl font-black text-slate-900 mb-2">Send Message</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Your Name</label>
                        <input
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          placeholder="e.g. Dr. John Doe"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                        <input
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          placeholder="e.g. john@university.edu"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Subject</label>
                      <input
                        type="text"
                        required
                        value={formState.subject}
                        onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                        placeholder="e.g. API Integration Queries"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Message</label>
                      <textarea
                        required
                        rows={5}
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        placeholder="Write details of your support query..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all duration-300 resize-none"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/10 disabled:opacity-50 cursor-pointer"
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <FiSend size={14} /> Send Message
                        </>
                      )}
                    </motion.button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
