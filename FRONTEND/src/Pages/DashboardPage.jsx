import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiBookOpen, FiFileText, FiBookmark, FiLoader, FiUpload, FiSearch, FiSliders, FiClock, FiCheckSquare, FiSquare, FiX, FiLayers, FiDownload } from 'react-icons/fi';
import useAuth from '../Hooks/useAuth';
import usePaper from '../Hooks/usePaper';
import PaperCard from '../Components/Paper/PaperCard.jsx';
import Toast from '../Components/Common/Toast.jsx';
import Navbar from '../Components/Common/Navbar.jsx';
import api from '../Utils/api';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { fetchPapers, toggleBookmark, deletePaper, loading } = usePaper();
  const navigate = useNavigate();

  const [papers, setPapers] = useState([]);
  const [stats, setStats] = useState({ total: 0, processing: 0, ready: 0, bookmarked: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBookmark, setFilterBookmark] = useState(false);
  const [filterStatus, setFilterStatus] = useState(''); // '', 'processing', 'ready', 'failed'
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState(null);

  // Literature Review multi-select state
  const [selectedPapers, setSelectedPapers] = useState(new Set());
  const [litReviewOpen, setLitReviewOpen] = useState(false);
  const [litReviewResult, setLitReviewResult] = useState('');
  const [litReviewLoading, setLitReviewLoading] = useState(false);

  const loadDashboardData = async () => {
    try {
      // 1. Fetch papers with current filters
      const filterData = {
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        status: filterStatus || undefined,
        isBookmarked: filterBookmark ? true : undefined,
      };

      const result = await fetchPapers(filterData);
      setPapers(result.papers);
      setTotalPages(result.totalPages);

      // 2. Fetch stats (we can calculate from total list or make a separate lightweight request,
      // here we query without pagination constraints to compute correct counts)
      const allResults = await fetchPapers({ limit: 1000 });
      const list = allResults.papers;
      
      const total = list.length;
      const processing = list.filter((p) => p.status === 'processing' || p.status === 'uploading').length;
      const ready = list.filter((p) => p.status === 'ready').length;
      const bookmarked = list.filter((p) => p.isBookmarked).length;

      setStats({ total, processing, ready, bookmarked });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentPage, filterStatus, filterBookmark]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadDashboardData();
  };

  const handleBookmarkToggle = async (paperId) => {
    try {
      const isNewBookmarked = await toggleBookmark(paperId);
      // Update local state
      setPapers(papers.map((p) => (p._id === paperId ? { ...p, isBookmarked: isNewBookmarked } : p)));
      setStats((prev) => ({
        ...prev,
        bookmarked: isNewBookmarked ? prev.bookmarked + 1 : prev.bookmarked - 1,
      }));
    } catch (err) {
      setToast({ message: 'Failed to update bookmark', type: 'error' });
    }
  };

  const handleDeletePaper = async (paperId) => {
    try {
      await deletePaper(paperId);
      setToast({ message: 'Paper deleted successfully', type: 'success' });
      loadDashboardData();
    } catch (err) {
      setToast({ message: 'Failed to delete paper', type: 'error' });
    }
  };

  const togglePaperSelect = (paperId) => {
    setSelectedPapers(prev => {
      const next = new Set(prev);
      next.has(paperId) ? next.delete(paperId) : next.add(paperId);
      return next;
    });
  };

  const handleCompileLitReview = async () => {
    const ids = Array.from(selectedPapers);
    if (ids.length < 2) return;
    const [seedId, ...additionalIds] = ids;
    try {
      setLitReviewLoading(true);
      setLitReviewOpen(true);
      setLitReviewResult('');
      await api.post(`/papers/${seedId}/agent-task`, {
        agentType: 'literature_review',
        additionalPaperIds: additionalIds
      });
      // Poll for result after processing time
      setTimeout(async () => {
        try {
          const outputRes = await api.get(`/papers/${seedId}/agent-outputs`);
          const review = outputRes.data.data?.literatureReview || '';
          setLitReviewResult(review || 'Literature review generation is still in progress. Please wait and try refreshing.');
        } catch (e) {
          setLitReviewResult('Failed to retrieve literature review. Please try again.');
        } finally {
          setLitReviewLoading(false);
        }
      }, 18000);
    } catch (err) {
      setLitReviewResult(`Error: ${err.message}`);
      setLitReviewLoading(false);
    }
  };

  const downloadLitReview = () => {
    const blob = new Blob([litReviewResult], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'literature_review.md'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950">Welcome back, {user?.fullName}!</h1>
          <p className="text-xs text-gray-400 mt-1">Here is a summary of your academic library and analysis tasks.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <FiFileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Papers</p>
              <h3 className="text-2xl font-bold text-gray-950 mt-1">{stats.total}</h3>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <FiClock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Analysing</p>
              <h3 className="text-2xl font-bold text-gray-950 mt-1">{stats.processing}</h3>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <FiBookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ready</p>
              <h3 className="text-2xl font-bold text-gray-950 mt-1">{stats.ready}</h3>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
              <FiBookmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bookmarked</p>
              <h3 className="text-2xl font-bold text-gray-950 mt-1">{stats.bookmarked}</h3>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FiSearch className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="appearance-none rounded-xl relative block w-full pl-10 pr-20 py-2 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              placeholder="Search keyword fallback..."
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50 text-xs font-semibold">
              <FiSliders className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent border-none outline-none pr-4 text-gray-700"
              >
                <option value="">All Statuses</option>
                <option value="processing">Analysing</option>
                <option value="ready">Ready</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Bookmark Filter */}
            <button
              onClick={() => {
                setFilterBookmark(!filterBookmark);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-semibold transition-all ${
                filterBookmark
                  ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200'
              }`}
            >
              <FiBookmark className={filterBookmark ? 'fill-current' : ''} />
              Bookmarked
            </button>
          </div>
        </div>

        {/* Papers Grid */}
        {loading && papers.length === 0 ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 h-[260px] animate-pulse space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-20 h-5 bg-gray-100 rounded-full" />
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                </div>
                <div className="w-3/4 h-6 bg-gray-100 rounded-lg" />
                <div className="w-1/2 h-4 bg-gray-100 rounded-lg" />
                <div className="border-t border-gray-50 pt-4 flex justify-between items-center mt-auto">
                  <div className="w-24 h-4 bg-gray-100 rounded-lg" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                    <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : papers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <div key={paper._id} className="relative">
                {/* Selection Checkbox for ready papers */}
                {paper.status === 'ready' && (
                  <button
                    onClick={() => togglePaperSelect(paper._id)}
                    className={`absolute top-3 left-3 z-10 p-1.5 rounded-lg transition-all border ${
                      selectedPapers.has(paper._id)
                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                        : 'bg-white/90 text-gray-400 border-gray-200 hover:border-blue-400 hover:text-blue-500'
                    }`}
                    title={selectedPapers.has(paper._id) ? 'Deselect for review' : 'Select for literature review'}
                  >
                    {selectedPapers.has(paper._id) ? <FiCheckSquare size={14} /> : <FiSquare size={14} />}
                  </button>
                )}
                <PaperCard
                  paper={paper}
                  onBookmarkToggle={handleBookmarkToggle}
                  onDelete={handleDeletePaper}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
            <FiFileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Your library is empty</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Upload your first academic research paper to begin extracting summaries, citations, and interactive features.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all duration-200 mt-6"
            >
              <FiUpload className="w-4 h-4" /> Upload Your First Paper
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-xs text-gray-500 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Floating Action Button: Compile Literature Review */}
      {selectedPapers.size >= 2 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <button
            onClick={handleCompileLitReview}
            className="flex items-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-2xl shadow-blue-500/40 font-bold text-sm transition-all border border-blue-400/30"
          >
            <FiLayers size={18} />
            Compile Literature Review ({selectedPapers.size} papers selected)
          </button>
        </div>
      )}

      {/* Literature Review Modal */}
      {litReviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { if (!litReviewLoading) setLitReviewOpen(false); }}>
          <div className="bg-[#0d1321] border border-[#1e293b] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
              <div>
                <h3 className="text-base font-bold text-white">Comparative Literature Review</h3>
                <p className="text-xs text-gray-400">{selectedPapers.size} papers synthesized by ResearchMind AI</p>
              </div>
              <div className="flex items-center gap-2">
                {litReviewResult && (
                  <button onClick={downloadLitReview} className="py-1.5 px-3 bg-[#1e293b] hover:bg-[#334155] rounded-lg text-xs font-bold text-gray-300 flex items-center gap-1.5">
                    <FiDownload size={12} /> Download
                  </button>
                )}
                {!litReviewLoading && (
                  <button onClick={() => setLitReviewOpen(false)} className="p-2 hover:bg-[#1b253b] rounded-xl text-gray-400 hover:text-white transition-colors">
                    <FiX size={18} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {litReviewLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-4">
                  <FiLoader className="text-4xl text-blue-500 animate-spin" />
                  <p className="text-gray-400 text-sm text-center">Synthesizing literature review...<br/><span className="text-xs text-gray-500">This may take 15-20 seconds</span></p>
                </div>
              ) : litReviewResult ? (
                <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono leading-relaxed">{litReviewResult}</pre>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">Starting literature review generation...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
