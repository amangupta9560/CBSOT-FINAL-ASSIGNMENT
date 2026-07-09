import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSend, FiShield, FiHeart } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-100 text-slate-600 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.div
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/10 transition-all duration-300"
                whileHover={{ rotate: 10, scale: 1.08 }}
              >
                R
              </motion.div>
              <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                ResearchMind<span className="text-blue-600">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-sm font-medium">
              Empowering academic and scientific breakthroughs with a coordinated workforce of 14 collaborative AI agents designed to extract, synthesize, and verify literature.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Home', to: '/' },
                { label: 'About Us', to: '/about' },
                { label: 'Sign In', to: '/login' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-slate-500 hover:text-blue-600 transition-colors duration-200 font-medium">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Features</h4>
            <ul className="space-y-2.5 text-sm">
              {['Literature Review', 'Interactive Mind Map', 'Grounded QA Chat', 'Writing Assistant', 'Flashcard Decks'].map((f) => (
                <li key={f} className="text-slate-500 hover:text-blue-600 cursor-default transition-colors font-medium">{f}</li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Stay Updated</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Subscribe to get the latest feature updates and research insights.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center">
              <input
                type="email"
                placeholder="Enter email"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
              />
              <button type="submit" className="absolute right-1 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors cursor-pointer" aria-label="Subscribe">
                <FiSend size={12} />
              </button>
            </form>
          </div>
        </div>

        <hr className="my-12 border-slate-200" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <FiShield />
            <span>&copy; {new Date().getFullYear()} ResearchMind AI. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Built with</span>
            <FiHeart className="text-red-500 animate-pulse fill-red-500" size={11} />
            <span>for the global scientific community.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
