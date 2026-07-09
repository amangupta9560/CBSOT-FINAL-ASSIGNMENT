import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookmark, FiTrash2, FiMessageSquare, FiBookOpen, FiCalendar, FiUser } from 'react-icons/fi';

const PaperCard = ({ paper, onBookmarkToggle, onDelete }) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(paper.isBookmarked);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    try {
      await onBookmarkToggle(paper._id);
    } catch (err) {
      // Revert if error
      setIsBookmarked(isBookmarked);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${paper.title}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(paper._id);
      } catch (err) {
        setIsDeleting(false);
      }
    }
  };

  // Author formatting: "First Author, Second Author et al."
  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown Authors';
    if (authors.length <= 2) return authors.join(', ');
    return `${authors[0]}, ${authors[1]} et al.`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusConfig = {
    processing: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      label: 'Analysing...',
      dot: 'bg-amber-500 animate-pulse',
    },
    ready: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      label: 'Ready',
      dot: 'bg-emerald-500',
    },
    failed: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      label: 'Failed',
      dot: 'bg-rose-500',
    },
    uploading: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      label: 'Uploading...',
      dot: 'bg-blue-500 animate-pulse',
    },
  };

  const currentStatus = statusConfig[paper.status] || statusConfig.processing;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      onClick={() => paper.status === 'ready' && navigate(`/papers/${paper._id}`)}
      className={`bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between h-[260px] relative overflow-hidden ${
        isDeleting ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div>
        {/* Top Header Row */}
        <div className="flex justify-between items-start gap-4">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStatus.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
            {currentStatus.label}
          </span>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors ${
              isBookmarked ? 'bg-blue-50 text-blue-600 border-blue-100' : 'text-gray-400 bg-white'
            }`}
          >
            <FiBookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3 className="mt-4 text-base font-bold text-gray-950 line-clamp-2 leading-snug group-hover:text-blue-600">
          {paper.title || paper.file?.originalFileName || 'Untitled Paper'}
        </h3>

        {/* Authors */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <FiUser className="w-3.5 h-3.5 opacity-70" />
          <span>{formatAuthors(paper.authors)}</span>
        </div>
      </div>

      <div>
        {/* Tags Row */}
        {paper.tags && paper.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 my-3">
            {paper.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-semibold uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
            {paper.tags.length > 3 && (
              <span className="text-[10px] text-gray-400 font-semibold align-middle leading-normal">
                +{paper.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer Actions Row */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-auto">
          {/* Upload Date */}
          <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold">
            <FiCalendar className="w-3.5 h-3.5" />
            {formatDate(paper.createdAt)}
          </span>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent transition-all"
              title="Delete paper"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
            
            {paper.status === 'ready' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/papers/${paper._id}?tab=chat`);
                  }}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-100 bg-white transition-all"
                  title="Chat with paper"
                >
                  <FiMessageSquare className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/papers/${paper._id}`);
                  }}
                  className="p-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
                  title="View summary and analysis"
                >
                  <FiBookOpen className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PaperCard;
