import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <FiCheckCircle className="w-5 h-5 text-emerald-600" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <FiAlertCircle className="w-5 h-5 text-rose-600" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <FiInfo className="w-5 h-5 text-blue-600" />,
    },
  };

  const currentType = typeConfig[type] || typeConfig.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 border rounded-xl shadow-lg ${currentType.bg} max-w-sm`}
    >
      {currentType.icon}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-auto"
      >
        <FiX className="w-4 h-4 opacity-70" />
      </button>
    </motion.div>
  );
};

export default Toast;
