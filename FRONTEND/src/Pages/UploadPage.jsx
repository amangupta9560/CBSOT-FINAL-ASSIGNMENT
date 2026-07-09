import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFileText, FiX, FiCheckCircle, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import Navbar from '../Components/Common/Navbar.jsx';
import Toast from '../Components/Common/Toast.jsx';
import useUpload from '../Hooks/useUpload';

const UploadPage = () => {
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const {
    file,
    tagInput,
    setTagInput,
    tags,
    isUploading,
    processingStatus,
    currentStep,
    processingError,
    steps,
    validateAndSetFile,
    removeFile,
    addTag,
    removeTag,
    executeUpload,
  } = useUpload(
    (id) => {
      setToast({ message: 'Analysis finished! Loading paper details...', type: 'success' });
      setTimeout(() => {
        navigate(`/papers/${id}`);
      }, 1500);
    },
    (errMessage) => {
      setToast({ message: errMessage, type: 'error' });
    }
  );

  // Formatting helper
  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleDrag = (e, isDragging) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      try {
        validateAndSetFile(e.dataTransfer.files[0]);
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      try {
        validateAndSetFile(e.target.files[0]);
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
      }
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      try {
        addTag(tagInput);
      } catch (err) {
        setToast({ message: err.message, type: 'error' });
      }
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Upload New Research Paper</h1>
          <p className="mt-2 text-sm text-gray-500">
            Submit your PDF to trigger our 14-agent AI pipeline for semantic parsing, citations, and summaries.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-8">
          <AnimatePresence mode="wait">
            {!isUploading ? (
              <motion.div
                key="upload-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Drop Zone */}
                {!file ? (
                  <div
                    onDragOver={(e) => handleDrag(e, true)}
                    onDragLeave={(e) => handleDrag(e, false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                    className="border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-2xl p-12 text-center bg-blue-50/20 hover:bg-blue-50/40 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="application/pdf"
                      className="hidden"
                    />
                    <FiUploadCloud className="w-14 h-14 text-blue-500 mb-4 group-hover:scale-105 transition-transform" />
                    <p className="text-base font-bold text-gray-900 mb-1">
                      Drag & drop your PDF here, or <span className="text-blue-600 hover:underline">browse</span>
                    </p>
                    <p className="text-xs text-gray-400 font-medium">Supports PDF files up to 25MB</p>
                  </div>
                ) : (
                  /* File Preview */
                  <div className="border border-gray-100 bg-gray-50/50 p-4 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      <FiFileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-400 font-semibold">{formatBytes(file.size)}</p>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Tags Metadata */}
                {file && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Add Tags (Keywords)
                    </label>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="appearance-none rounded-xl relative block w-full px-4 py-2.5 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                      placeholder="Type a tag and press Enter"
                    />
                    
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-100 text-xs font-semibold"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(idx)}
                              className="p-0.5 hover:bg-blue-100 text-blue-600 hover:text-blue-800 rounded-md"
                            >
                              <FiX className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <button
                  type="button"
                  onClick={executeUpload}
                  disabled={!file}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-40 shadow hover:shadow-md transition-all duration-200"
                >
                  Upload & Analyse Paper
                </button>
              </motion.div>
            ) : (
              /* Stepper UI */
              <motion.div
                key="processing-stepper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">AI Agents at Work</h3>
                  <p className="text-xs text-gray-500 mt-1">This takes about 45-60 seconds. Do not reload the page.</p>
                </div>

                {/* Progress list */}
                <div className="space-y-6 max-w-lg mx-auto">
                  {steps.map((step, idx) => {
                    const isCompleted = idx < currentStep;
                    const isCurrent = idx === currentStep && !processingError;
                    const isPending = idx > currentStep;
                    const isFailedStep = idx === currentStep && processingStatus === 'failed';

                    let icon = <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />;
                    let borderClass = 'border-gray-200';
                    let textClass = 'text-gray-400';

                    if (isCompleted) {
                      icon = <FiCheckCircle className="w-5 h-5 text-emerald-500" />;
                      borderClass = 'border-emerald-500';
                      textClass = 'text-gray-900';
                    } else if (isCurrent) {
                      icon = <FiLoader className="w-5 h-5 text-blue-600 animate-spin" />;
                      borderClass = 'border-blue-600';
                      textClass = 'text-gray-950 font-bold';
                    } else if (isFailedStep) {
                      icon = <FiAlertTriangle className="w-5 h-5 text-red-500" />;
                      borderClass = 'border-red-500';
                      textClass = 'text-red-900';
                    }

                    return (
                      <div key={idx} className="flex gap-4 relative">
                        {/* Connecting Line */}
                        {idx < 4 && (
                          <div
                            className={`absolute left-2.5 top-6 bottom-0 w-0.5 border-l-2 ${
                              idx < currentStep ? 'border-emerald-500' : 'border-gray-200 border-dashed'
                            } -mb-8 z-0`}
                          />
                        )}

                        <div className="flex-shrink-0 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white">
                          {icon}
                        </div>
                        
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${textClass}`}>{step.title}</p>
                          {(isCurrent || isCompleted || isFailedStep) && (
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.desc}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Error Box */}
                {processingStatus === 'failed' && (
                  <div className="max-w-lg mx-auto bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-sm text-rose-800">
                    <FiAlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
                    <div>
                      <p className="font-bold">Analysis Failed</p>
                      <p className="mt-1 leading-relaxed">{processingError}</p>
                      <button
                        onClick={removeFile}
                        className="mt-3 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline"
                      >
                        Try re-uploading another PDF file
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
