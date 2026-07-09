import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiUser, FiArrowRight, FiLogOut, FiUpload, FiGrid } from 'react-icons/fi';
import useAuth from '../../Hooks/useAuth';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll to add shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const publicNavs = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
  ];

  const authNavs = [
    { label: 'Dashboard', path: '/dashboard', icon: <FiGrid size={13} /> },
    { label: 'Upload', path: '/upload', icon: <FiUpload size={13} /> },
  ];

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-md shadow-slate-200/40 border-b border-slate-100'
          : 'bg-white/70 backdrop-blur-xl border-b border-slate-100/80'
      } text-slate-800`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* ── Logo ───────────────────────────── */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.div
                className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20"
                whileHover={{ rotate: 10, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                R
              </motion.div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                ResearchMind
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI</span>
              </span>
            </Link>
          </div>

          {/* ── Desktop Nav ─────────────────────── */}
          <div className="hidden md:flex items-center gap-8">

            {/* Public links */}
            <div className="flex items-center gap-6">
              {publicNavs.map((nav) => (
                <Link
                  key={nav.path}
                  to={nav.path}
                  className="relative py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors duration-200"
                >
                  {nav.label}
                  {isActive(nav.path) && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}

              {/* Auth-gated nav links */}
              {isAuthenticated &&
                authNavs.map((nav) => (
                  <Link
                    key={nav.path}
                    to={nav.path}
                    className={`flex items-center gap-1 relative py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
                      isActive(nav.path) ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {nav.icon} {nav.label}
                    {isActive(nav.path) && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                ))}
            </div>

            <div className="h-4 w-px bg-slate-200" />

            {/* Auth buttons */}
            <AnimatePresence mode="wait">
              {isAuthenticated ? (
                <motion.div
                  key="authenticated"
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-[9px] font-black">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="max-w-[120px] truncate">{user?.fullName || 'User'}</span>
                  </div>
                  <motion.button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <FiLogOut size={13} /> Logout
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="unauthenticated"
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to="/login"
                    className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-transparent text-xs font-bold uppercase tracking-wider rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/10 transition-all duration-200"
                    >
                      Get Started <FiArrowRight size={11} />
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Mobile menu button ───────────────── */}
          <div className="flex items-center md:hidden">
            {isAuthenticated && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-black mr-3">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-500 hover:text-slate-900 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ─────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden border-t border-slate-100 bg-white/98 backdrop-blur-lg overflow-hidden"
          >
            <div className="px-4 pt-4 pb-6 space-y-1">

              {/* Public links */}
              {publicNavs.map((nav) => (
                <Link
                  key={nav.path}
                  to={nav.path}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-colors ${
                    isActive(nav.path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {nav.label}
                </Link>
              ))}

              {/* Auth nav links */}
              {isAuthenticated &&
                authNavs.map((nav) => (
                  <Link
                    key={nav.path}
                    to={nav.path}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-colors ${
                      isActive(nav.path)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {nav.icon} {nav.label}
                  </Link>
                ))}

              <hr className="border-slate-100 my-3" />

              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-xs text-slate-400 font-semibold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-black">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    Signed in as <span className="text-slate-700">{user?.fullName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut size={14} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/10"
                  >
                    Get Started <FiArrowRight size={14} />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
