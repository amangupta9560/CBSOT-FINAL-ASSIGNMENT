import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/40 backdrop-blur-sm">
      <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-xl">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-gray-700">Loading ResearchMind AI...</p>
      </div>
    </div>
  );
};

export default Loader;
