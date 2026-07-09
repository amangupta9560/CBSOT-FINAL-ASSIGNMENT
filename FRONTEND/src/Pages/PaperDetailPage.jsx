import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiBookOpen, FiLayers, FiList, FiTrendingUp, 
  FiCheckCircle, FiCpu, FiSend, FiRefreshCw, FiExternalLink, FiAward, FiCopy,
  FiGrid, FiZap, FiFileText, FiDownload, FiMaximize2, FiMinimize2
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../Utils/api';
import useChat from '../Hooks/useChat';

const PaperDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paper, setPaper] = useState(null);
  const [outputs, setOutputs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  
  // Flashcard states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Quiz states
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedQuestions, setSubmittedQuestions] = useState({});
  
  // QA Chat states via useChat hook
  const {
    chatHistory,
    loading: chatLoading,
    sendMessage: sendChatMessage
  } = useChat(id);

  const [chatQuery, setChatQuery] = useState('');
  
  // Citation Copy State
  const [copiedFormat, setCopiedFormat] = useState('');

  // Regeneration loading state
  const [regenerating, setRegenerating] = useState(false);

  // PDF Split-Pane state
  const [splitView, setSplitView] = useState(false);
  const [pdfSearch, setPdfSearch] = useState('');

  // Writing Assistant state
  const [writingMode, setWritingMode] = useState('slides');
  const [writingDraft, setWritingDraft] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [writingStatus, setWritingStatus] = useState(''); // status message shown during generation

  // Interactive Mind Map state
  const svgRef = useRef(null);
  const [mmNodes, setMmNodes] = useState(null);  // derived from mindMap on load
  const [mmNodePositions, setMmNodePositions] = useState({});
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch paper details
      const paperRes = await api.get(`/papers/${id}`);
      setPaper(paperRes.data.data);
      
      // Fetch agent outputs
      const outputRes = await api.get(`/papers/${id}/agent-outputs`);
      setOutputs(outputRes.data.data);
      
    } catch (err) {
      console.error('Failed to load paper details:', err);
      setError(err.message || 'Failed to load details. Ensure processing succeeded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleCopyCitation = (text, format) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(''), 2000);
  };

  const handleAnswerSelect = (questionIdx, option) => {
    if (submittedQuestions[questionIdx]) return;
    setSelectedAnswers(prev => ({ ...prev, [questionIdx]: option }));
  };

  const handleSubmitAnswer = (questionIdx) => {
    if (!selectedAnswers[questionIdx]) return;
    setSubmittedQuestions(prev => ({ ...prev, [questionIdx]: true }));
  };

  const handleSendQuery = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim() || chatLoading) return;
    
    const queryToSend = chatQuery;
    setChatQuery('');

    try {
      await sendChatMessage(queryToSend, paper?.userId);
    } catch (err) {
      console.error('QA Chat Error:', err);
    }
  };


  const triggerRegeneration = async (agentType) => {
    try {
      setRegenerating(true);
      await api.post(`/papers/${id}/agent-task`, {
        agentType
      });
      alert(`On-demand regeneration of "${agentType}" started in the background. It will automatically update in a few seconds.`);
      // Poll details again after short delay
      setTimeout(fetchDetails, 6000);
    } catch (err) {
      alert(`Failed to trigger regeneration: ${err.message}`);
    } finally {
      setRegenerating(false);
    }
  };

  // ── Mind map position builder ── must be BEFORE any early return ──
  // Read from outputs directly (not the derived mindMap const which is below the early returns)
  useEffect(() => {
    const mm = outputs?.mindMap?.root || null;
    if (!mm) return;
    const positions = {};
    const rootX = 520, rootY = 60;
    positions[mm.id || 'root'] = { x: rootX, y: rootY, label: mm.label };
    const children = mm.children || [];
    const spread = Math.max(900, children.length * 160);
    children.forEach((child, cIdx) => {
      const cx = rootX - spread / 2 + (spread / Math.max(children.length - 1, 1)) * cIdx;
      const cy = rootY + 140;
      positions[child.id || `c_${cIdx}`] = { x: cx, y: cy, label: child.label };
      (child.children || []).forEach((leaf, lIdx) => {
        const lx = cx - 60 + lIdx * 130;
        const ly = cy + 130;
        positions[leaf.id || `l_${cIdx}_${lIdx}`] = { x: lx, y: ly, label: leaf.label };
      });
    });
    setMmNodePositions(positions);
    setMmNodes(mm);
  }, [outputs]);

  // ── Node drag handlers ── must be BEFORE any early return ──
  const handleNodeMouseDown = useCallback((e, nodeId) => {
    e.preventDefault();
    const svgRect = svgRef.current?.getBoundingClientRect();
    const pos = mmNodePositions[nodeId];
    if (!pos) return;
    setDraggingNode(nodeId);
    setDragOffset({ x: e.clientX - svgRect.left - pos.x, y: e.clientY - svgRect.top - pos.y });
  }, [mmNodePositions]);

  const handleSvgMouseMove = useCallback((e) => {
    if (!draggingNode) return;
    const svgRect = svgRef.current?.getBoundingClientRect();
    setMmNodePositions(prev => ({
      ...prev,
      [draggingNode]: { ...prev[draggingNode], x: e.clientX - svgRect.left - dragOffset.x, y: e.clientY - svgRect.top - dragOffset.y }
    }));
  }, [draggingNode, dragOffset]);

  const handleSvgMouseUp = useCallback(() => setDraggingNode(null), []);
  // ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-4">
          <FiRefreshCw className="animate-spin text-4xl text-blue-500" />
          <p className="text-gray-400 animate-pulse text-sm">Parsing agent outputs and knowledge tree...</p>
        </div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex items-center justify-center p-6 text-center">
        <div className="bg-[#121824] border border-[#1e293b] p-8 rounded-2xl max-w-md w-full space-y-6 shadow-2xl">
          <h2 className="text-xl font-bold text-red-400">Loading Error</h2>
          <p className="text-gray-400 text-sm leading-relaxed">{error || 'Paper not found.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-[#1e293b] hover:bg-[#334155] rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Ensure fallback structures
  const summary = outputs?.summary || {};
  const citations = outputs?.citations || {};
  const researchGaps = outputs?.researchGaps || {};
  const futureWork = outputs?.futureWork?.suggestions || [];
  const experimentSuggestions = outputs?.experimentSuggestions?.experiments || [];
  const keywords = outputs?.keywords || { technical: [], general: [] };
  const mindMap = outputs?.mindMap?.root || null;
  const equations = outputs?.equations?.list || [];
  const highlights = outputs?.highlights?.list || [];
  const flashcards = outputs?.flashcards || [];
  const quiz = outputs?.quiz || [];
  const researchIdeas = outputs?.researchIdeas || [];
  const figures = outputs?.figures || [];
  const writingDrafts = outputs?.writingDrafts || {};

  const exportMindMapSVG = () => {
    if (!svgRef.current) return;
    const svgData = svgRef.current.outerHTML;
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'mind_map.svg'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportMindMapJSON = () => {
    const blob = new Blob([JSON.stringify({ nodes: mmNodePositions }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'mind_map.json'; a.click();
    URL.revokeObjectURL(url);
  };

  // Writing assistant draft trigger — smart polling loop
  const handleDraftWriting = async () => {
    try {
      setDrafting(true);
      setWritingDraft('');
      setWritingStatus('Sending request to AI agent...');

      await api.post(`/papers/${id}/agent-task`, {
        agentType: 'writing_assistant',
        writingMode
      });

      setWritingStatus('Agent started. Waiting for draft to be generated...');

      // Smart polling: check every 5 seconds, up to 8 attempts (40 seconds total)
      let attempts = 0;
      const maxAttempts = 8;
      const pollInterval = 5000;

      const poll = async () => {
        attempts++;
        setWritingStatus(`Generating draft... (check ${attempts}/${maxAttempts})`);
        try {
          const outputRes = await api.get(`/papers/${id}/agent-outputs`);
          const drafts = outputRes.data.data?.writingDrafts || {};
          const result = drafts[writingMode];
          if (result && result.trim().length > 50) {
            setWritingDraft(result);
            setWritingStatus('Draft ready!');
            setDrafting(false);
            return;
          }
        } catch (e) {
          // ignore poll errors, keep trying
        }

        if (attempts >= maxAttempts) {
          setWritingStatus('Generation is taking longer than expected. Click "Refresh" to check again.');
          setDrafting(false);
        } else {
          setTimeout(poll, pollInterval);
        }
      };

      // Start polling after initial 6-second warm-up
      setTimeout(poll, 6000);

    } catch (err) {
      setWritingStatus(`Error: ${err.response?.data?.message || err.message}`);
      setDrafting(false);
    }
  };

  // Refresh from DB (for when user returns to tab)
  const handleRefreshDraft = async () => {
    try {
      setWritingStatus('Checking for latest draft...');
      const outputRes = await api.get(`/papers/${id}/agent-outputs`);
      const drafts = outputRes.data.data?.writingDrafts || {};
      const result = drafts[writingMode];
      if (result && result.trim().length > 10) {
        setWritingDraft(result);
        setWritingStatus('Draft loaded from database.');
      } else {
        setWritingStatus('No draft found yet for this mode.');
      }
    } catch (e) {
      setWritingStatus('Failed to refresh. Try again.');
    }
  };

  const downloadDraft = () => {
    const content = writingDraft || writingDrafts[writingMode] || '';
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${writingMode}_draft.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyDraft = () => {
    const content = writingDraft || writingDrafts[writingMode] || '';
    if (!content) return;
    navigator.clipboard.writeText(content);
    setWritingStatus('Copied to clipboard!');
    setTimeout(() => setWritingStatus(''), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-[#0d1321]/90 backdrop-blur-md border-b border-[#1e293b] py-4 px-6 flex items-center justify-between">
        <div className="flex items-center space-y-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-[#1b253b] rounded-xl text-gray-400 hover:text-white transition-colors mr-3"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white max-w-xl truncate">{paper.title || paper.file.originalFileName}</h1>
            <p className="text-xs text-gray-400">
              {paper.authors?.join(', ') || 'Unknown Authors'} • {paper.publicationYear || 'n.d.'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {paper.file.cloudinaryUrl && (
            <a
              href={paper.file.cloudinaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 bg-[#1e293b] hover:bg-[#334155] rounded-xl text-xs font-semibold text-gray-200 transition-all flex items-center gap-1.5 border border-[#334155]/30"
            >
              View Original PDF <FiExternalLink size={12} />
            </a>
          )}
          {paper.file.cloudinaryUrl && (
            <button
              onClick={() => setSplitView(v => !v)}
              className={`p-2.5 rounded-xl text-xs font-semibold transition-colors border ${
                splitView ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#121824] hover:bg-[#1b253b] text-gray-400 hover:text-white border-[#1e293b]'
              }`}
              title={splitView ? 'Close PDF Split View' : 'Open PDF Split View'}
            >
              {splitView ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
            </button>
          )}
          <button
            onClick={fetchDetails}
            className="p-2.5 bg-[#121824] hover:bg-[#1b253b] rounded-xl text-gray-400 hover:text-white transition-colors border border-[#1e293b]"
            title="Refresh Analysis Outputs"
          >
            <FiRefreshCw size={16} className={regenerating ? "animate-spin text-blue-500" : ""} />
          </button>
        </div>
      </header>


      <div className={`flex-1 flex ${splitView ? 'flex-row' : 'flex-col md:flex-row'}`} style={splitView ? { height: 'calc(100vh - 73px)', overflow: 'hidden' } : {}}>

        {/* PDF Pane — only visible in split view */}
        {splitView && paper.file.cloudinaryUrl && (
          <div className="w-1/2 border-r border-[#1e293b] flex flex-col" style={{ height: '100%' }}>
            <div className="p-2 bg-[#0d1321] border-b border-[#1e293b] flex items-center gap-2">
              <FiFileText size={14} className="text-blue-400" />
              <span className="text-xs text-gray-400 font-semibold">PDF Viewer — Inline</span>
              {pdfSearch && <span className="text-xs text-blue-400 ml-auto">Searching: "{pdfSearch}"</span>}
              <button onClick={() => setPdfSearch('')} className="text-[10px] text-gray-500 hover:text-red-400 ml-1">{pdfSearch && '✕'}</button>
            </div>
            <iframe
              src={`${paper.file.cloudinaryUrl}${pdfSearch ? `#search=${encodeURIComponent(pdfSearch)}` : ''}`}
              className="flex-1 w-full bg-white"
              title="Paper PDF Viewer"
              allow="fullscreen"
            />
          </div>
        )}

        {/* Analysis panel (sidebar + main) */}
        <div className={`flex ${splitView ? 'w-1/2 flex-col overflow-y-auto' : 'flex-1 flex-col md:flex-row'}`}>
        {/* Sidebar Nav Tabs */}
        <aside className="w-full md:w-64 bg-[#0d1321] border-b md:border-b-0 md:border-r border-[#1e293b] p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible scrollbar-none">
          <button
            onClick={() => setActiveTab('summary')}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 shrink-0 md:shrink ${
              activeTab === 'summary' 
                ? 'bg-[#1b253b] text-blue-400 shadow-lg shadow-blue-500/5' 
                : 'text-gray-400 hover:text-white hover:bg-[#121824]'
            }`}
          >
            <FiBookOpen size={18} /> Summary & Metadata
          </button>
          
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 shrink-0 md:shrink ${
              activeTab === 'flashcards' 
                ? 'bg-[#1b253b] text-blue-400 shadow-lg shadow-blue-500/5' 
                : 'text-gray-400 hover:text-white hover:bg-[#121824]'
            }`}
          >
            <FiLayers size={18} /> Study Flashcards
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 shrink-0 md:shrink ${
              activeTab === 'quiz' 
                ? 'bg-[#1b253b] text-blue-400 shadow-lg shadow-blue-500/5' 
                : 'text-gray-400 hover:text-white hover:bg-[#121824]'
            }`}
          >
            <FiAward size={18} /> Assessment Quiz
          </button>

          <button
            onClick={() => setActiveTab('mindmap')}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 shrink-0 md:shrink ${
              activeTab === 'mindmap' 
                ? 'bg-[#1b253b] text-blue-400 shadow-lg shadow-blue-500/5' 
                : 'text-gray-400 hover:text-white hover:bg-[#121824]'
            }`}
          >
            <FiTrendingUp size={18} /> Knowledge Mind Map
          </button>

          <button
            onClick={() => setActiveTab('gaps')}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 shrink-0 md:shrink ${
              activeTab === 'gaps' 
                ? 'bg-[#1b253b] text-blue-400 shadow-lg shadow-blue-500/5' 
                : 'text-gray-400 hover:text-white hover:bg-[#121824]'
            }`}
          >
            <FiList size={18} /> Gaps & Suggestions
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 shrink-0 md:shrink ${
              activeTab === 'qa' 
                ? 'bg-[#1b253b] text-blue-400 shadow-lg shadow-blue-500/5' 
                : 'text-gray-400 hover:text-white hover:bg-[#121824]'
            }`}
          >
            <FiCpu size={18} /> Grounded QA Chat
          </button>

          <button
            onClick={() => setActiveTab('figures')}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 shrink-0 md:shrink ${
              activeTab === 'figures' 
                ? 'bg-[#1b253b] text-blue-400 shadow-lg shadow-blue-500/5' 
                : 'text-gray-400 hover:text-white hover:bg-[#121824]'
            }`}
          >
            <FiGrid size={18} /> Visual Assets
          </button>

          <button
            onClick={() => setActiveTab('writing')}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 shrink-0 md:shrink ${
              activeTab === 'writing' 
                ? 'bg-[#1b253b] text-blue-400 shadow-lg shadow-blue-500/5' 
                : 'text-gray-400 hover:text-white hover:bg-[#121824]'
            }`}
          >
            <FiZap size={18} /> AI Writing Assistant
          </button>
        </aside>

        {/* Tab Content Panels */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-4xl">
          
          {/* TAB 1: SUMMARY & METADATA */}
          {activeTab === 'summary' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#121824] border border-[#1e293b] p-6 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 text-xs bg-blue-500/10 text-blue-400 rounded-bl-xl font-bold uppercase tracking-wider">Quick Read</div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Plain English Explanation</h3>
                  <p className="text-gray-200 text-sm leading-relaxed">{summary.simple || 'No simple summary available.'}</p>
                </div>
                <div className="bg-[#121824] border border-[#1e293b] p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 text-xs bg-purple-500/10 text-purple-400 rounded-bl-xl font-bold uppercase tracking-wider">Technical</div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Technical Analysis Summary</h3>
                  <p className="text-gray-200 text-sm leading-relaxed">{summary.technical || 'No technical summary available.'}</p>
                </div>
              </div>

              {/* In-depth summaries */}
              <div className="bg-[#121824] border border-[#1e293b] p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Methodology Overview</h3>
                  <p className="text-gray-200 text-sm leading-relaxed">{summary.methodology || 'No methodology specified.'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Key Research Findings & Results</h3>
                  <p className="text-gray-200 text-sm leading-relaxed">{summary.results || 'No results summarized.'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Key Stated Contributions</h3>
                  <ul className="list-none space-y-2 mt-2">
                    {summary.keyContributions?.map((c, i) => (
                      <li key={i} className="text-sm text-gray-200 flex items-start gap-2">
                        <FiCheckCircle className="text-green-500 mt-0.5 shrink-0" />
                        <span>{c}</span>
                      </li>
                    )) || <p className="text-sm text-gray-400">None specified.</p>}
                  </ul>
                </div>
              </div>

              {/* Highlights & Takeaways */}
              {highlights.length > 0 && (
                <div className="bg-[#121824] border border-[#1e293b] p-6 rounded-2xl">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Paper Highlights & Notable Quotes</h3>
                  <div className="space-y-4">
                    {highlights.map((h, i) => (
                      <blockquote key={i} className="border-l-2 border-blue-500 pl-4 py-1.5 italic text-gray-200 text-sm leading-relaxed">
                        "{h}"
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}

              {/* Math / Equations */}
              {equations.length > 0 && (
                <div className="bg-[#121824] border border-[#1e293b] p-6 rounded-2xl">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Equations & Formalisms</h3>
                  <div className="space-y-4">
                    {equations.map((eq, i) => (
                      <div key={i} className="p-4 bg-[#0d1321] rounded-xl border border-[#1e293b] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                          <code className="text-blue-400 font-mono text-sm">{eq.latex}</code>
                          <p className="text-gray-400 text-xs mt-1">{eq.description}</p>
                        </div>
                        {eq.pageNumber && <span className="px-2.5 py-1 bg-[#1e293b] text-gray-400 text-xs rounded-lg font-bold">Page {eq.pageNumber}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Citation Formats */}
              <div className="bg-[#121824] border border-[#1e293b] p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Bibliographic Citations</h3>
                <div className="space-y-4">
                  {Object.entries(citations).map(([format, text]) => {
                    if (format === 'generatedAt') return null;
                    return (
                      <div key={format} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
                          <span>{format}</span>
                          <button
                            onClick={() => handleCopyCitation(text, format)}
                            className="p-1 hover:bg-[#1e293b] rounded text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                          >
                            <FiCopy size={12} /> {copiedFormat === format ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <pre className="p-3 bg-[#0d1321] border border-[#1e293b] rounded-xl text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed select-all">
                          {text}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="space-y-8 animate-fadeIn flex flex-col items-center">
              <div className="w-full flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Concept Study Deck</h2>
                  <p className="text-xs text-gray-400">Review key definitions, metrics, and conclusions (total: {flashcards.length})</p>
                </div>
                <button
                  onClick={() => triggerRegeneration('flashcards')}
                  disabled={regenerating}
                  className="py-2 px-3 bg-[#1e293b] hover:bg-[#334155] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-gray-300 border border-[#334155]/20 disabled:opacity-55"
                >
                  <FiRefreshCw size={12} /> Regenerate
                </button>
              </div>

              {flashcards.length > 0 ? (
                <div className="w-full max-w-lg space-y-6 flex flex-col items-center">
                  
                  {/* Card Container with Perspective */}
                  <div 
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-full h-72 cursor-pointer relative preserve-3d transition-transform duration-500 rounded-2xl select-none"
                    style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                  >
                    
                    {/* Front Face */}
                    <div className="absolute inset-0 w-full h-full bg-[#121824] border border-[#1e293b] backface-hidden p-8 rounded-2xl flex flex-col justify-between shadow-2xl">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                          {flashcards[currentCardIndex].topic || 'Topic'}
                        </span>
                        <span className="px-2 py-0.5 border border-[#1e293b] text-gray-400 text-[10px] uppercase font-bold rounded">
                          {flashcards[currentCardIndex].difficulty || 'Difficulty'}
                        </span>
                      </div>
                      
                      <p className="text-center text-lg font-bold text-white leading-relaxed my-auto">
                        {flashcards[currentCardIndex].question}
                      </p>
                      
                      <p className="text-center text-xs text-gray-500 uppercase tracking-widest mt-auto font-bold animate-pulse">
                        Click card to flip
                      </p>
                    </div>

                    {/* Back Face */}
                    <div 
                      className="absolute inset-0 w-full h-full bg-[#09152b] border border-blue-500/30 backface-hidden p-8 rounded-2xl flex flex-col justify-between shadow-2xl"
                      style={{ transform: 'rotateY(180deg)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-lg uppercase tracking-wider">Answer</span>
                        <span className="text-gray-500 text-xs">Card {currentCardIndex + 1} of {flashcards.length}</span>
                      </div>

                      <p className="text-center text-sm font-semibold text-gray-200 leading-relaxed my-auto">
                        {flashcards[currentCardIndex].answer}
                      </p>

                      <p className="text-center text-xs text-gray-500 uppercase tracking-widest mt-auto font-bold">
                        Click card to flip back
                      </p>
                    </div>
                  </div>

                  {/* Stepper Buttons */}
                  <div className="flex items-center justify-center gap-6 w-full mt-4">
                    <button
                      disabled={currentCardIndex === 0}
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex(prev => prev - 1);
                      }}
                      className="py-2.5 px-5 bg-[#121824] hover:bg-[#1b253b] border border-[#1e293b] rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:hover:bg-[#121824]"
                    >
                      Previous
                    </button>
                    
                    <span className="text-sm font-bold text-gray-400">
                      {currentCardIndex + 1} / {flashcards.length}
                    </span>

                    <button
                      disabled={currentCardIndex === flashcards.length - 1}
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex(prev => prev + 1);
                      }}
                      className="py-2.5 px-5 bg-[#121824] hover:bg-[#1b253b] border border-[#1e293b] rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:hover:bg-[#121824]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">No flashcards found. Click Regenerate to compile them.</div>
              )}
            </div>
          )}

          {/* TAB 3: QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Assessment & Review Quiz</h2>
                  <p className="text-xs text-gray-400">Test your retention of the research methodology and results (total: {quiz.length} MCQs)</p>
                </div>
                <button
                  onClick={() => triggerRegeneration('quiz')}
                  disabled={regenerating}
                  className="py-2 px-3 bg-[#1e293b] hover:bg-[#334155] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-gray-300 border border-[#334155]/20 disabled:opacity-55"
                >
                  <FiRefreshCw size={12} /> Regenerate
                </button>
              </div>

              {quiz.length > 0 ? (
                <div className="space-y-8">
                  {quiz.map((q, qIdx) => {
                    const isSubmitted = submittedQuestions[qIdx];
                    const selectedOption = selectedAnswers[qIdx];
                    const isCorrect = selectedOption?.startsWith(q.correctAnswer);

                    return (
                      <div key={qIdx} className="bg-[#121824] border border-[#1e293b] p-6 rounded-2xl space-y-4 shadow-xl">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-base font-bold text-white leading-relaxed">
                            <span className="text-blue-400 mr-1.5">Question {qIdx + 1}:</span>
                            {q.question}
                          </h4>
                          {isSubmitted && (
                            <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase shrink-0 ${
                              isCorrect ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          )}
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-3">
                          {q.options.map((opt, optIdx) => {
                            const optionChar = opt.trim().substring(0, 1);
                            const isSelected = selectedOption === opt;
                            const isCorrectOpt = optionChar === q.correctAnswer;
                            
                            let buttonStyle = "border-[#1e293b] hover:bg-[#1b253b] hover:border-gray-500";
                            if (isSelected) buttonStyle = "border-blue-500 bg-blue-500/5 text-blue-400";
                            if (isSubmitted) {
                              if (isCorrectOpt) buttonStyle = "border-green-500 bg-green-500/10 text-green-400";
                              else if (isSelected) buttonStyle = "border-red-500 bg-red-500/10 text-red-400 opacity-60";
                              else buttonStyle = "border-[#1e293b] opacity-40";
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={isSubmitted}
                                onClick={() => handleAnswerSelect(qIdx, opt)}
                                className={`w-full py-3.5 px-5 border rounded-xl text-left text-sm font-semibold transition-all flex items-center justify-between ${buttonStyle}`}
                              >
                                <span>{opt}</span>
                                {isSubmitted && isCorrectOpt && <FiCheckCircle className="text-green-500 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Submit Actions */}
                        {!isSubmitted && (
                          <button
                            disabled={!selectedOption}
                            onClick={() => handleSubmitAnswer(qIdx)}
                            className="py-2 px-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-sm font-bold text-white rounded-xl transition-all"
                          >
                            Submit Answer
                          </button>
                        )}

                        {/* Explanation Box */}
                        {isSubmitted && (
                          <div className="p-4 bg-[#0d1321] rounded-xl border border-[#1e293b] text-xs text-gray-400 leading-relaxed">
                            <strong className="text-gray-300 block mb-1">Explanation:</strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">No quiz questions generated yet. Click Regenerate to compile.</div>
              )}
            </div>
          )}

          {/* TAB 4: INTERACTIVE MIND MAP */}
          {activeTab === 'mindmap' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">Interactive Mind Map</h2>
                  <p className="text-xs text-gray-400">Drag nodes to rearrange. Export as SVG or JSON.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={exportMindMapSVG} className="py-2 px-3 bg-[#1e293b] hover:bg-[#334155] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-gray-300 border border-[#334155]/20">
                    <FiDownload size={12} /> SVG
                  </button>
                  <button onClick={exportMindMapJSON} className="py-2 px-3 bg-[#1e293b] hover:bg-[#334155] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-gray-300 border border-[#334155]/20">
                    <FiDownload size={12} /> JSON
                  </button>
                  <button
                    onClick={() => triggerRegeneration('mindmap')}
                    disabled={regenerating}
                    className="py-2 px-3 bg-[#1e293b] hover:bg-[#334155] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-gray-300 border border-[#334155]/20 disabled:opacity-55"
                  >
                    <FiRefreshCw size={12} /> Regenerate
                  </button>
                </div>
              </div>

              {mmNodes && Object.keys(mmNodePositions).length > 0 ? (
                <div className="bg-[#121824] border border-[#1e293b] rounded-2xl shadow-xl overflow-hidden">
                  <svg
                    ref={svgRef}
                    width="100%"
                    height="520"
                    viewBox="0 0 1040 520"
                    className="cursor-default select-none"
                    style={{ background: 'transparent' }}
                    onMouseMove={handleSvgMouseMove}
                    onMouseUp={handleSvgMouseUp}
                    onMouseLeave={handleSvgMouseUp}
                  >
                    {/* Draw edges first */}
                    {(() => {
                      const edges = [];
                      const rootId = mmNodes.id || 'root';
                      const rootPos = mmNodePositions[rootId];
                      (mmNodes.children || []).forEach((child, cIdx) => {
                        const childId = child.id || `c_${cIdx}`;
                        const childPos = mmNodePositions[childId];
                        if (rootPos && childPos) {
                          edges.push(<line key={`re_${cIdx}`} x1={rootPos.x} y1={rootPos.y + 22} x2={childPos.x} y2={childPos.y - 22} stroke="#334155" strokeWidth="1.5" strokeDasharray="4 2" />);
                        }
                        (child.children || []).forEach((leaf, lIdx) => {
                          const leafId = leaf.id || `l_${cIdx}_${lIdx}`;
                          const leafPos = mmNodePositions[leafId];
                          if (childPos && leafPos) {
                            edges.push(<line key={`le_${cIdx}_${lIdx}`} x1={childPos.x} y1={childPos.y + 18} x2={leafPos.x} y2={leafPos.y - 18} stroke="#1e293b" strokeWidth="1.5" />);
                          }
                        });
                      });
                      return edges;
                    })()}

                    {/* Draw nodes */}
                    {Object.entries(mmNodePositions).map(([nodeId, pos]) => {
                      const isRoot = nodeId === (mmNodes.id || 'root');
                      const isChild = mmNodes.children?.some(c => (c.id || `c_${mmNodes.children.indexOf(c)}`) === nodeId);
                      const w = isRoot ? 180 : isChild ? 150 : 120;
                      const h = isRoot ? 44 : isChild ? 36 : 30;
                      const fillColor = isRoot ? '#2563eb' : isChild ? '#1b253b' : '#0d1321';
                      const borderColor = isRoot ? '#3b82f6' : isChild ? '#334155' : '#1e293b';
                      const textColor = isRoot ? '#ffffff' : isChild ? '#93c5fd' : '#9ca3af';
                      const fontSize = isRoot ? 11 : isChild ? 10 : 9;
                      return (
                        <g
                          key={nodeId}
                          transform={`translate(${pos.x - w/2}, ${pos.y - h/2})`}
                          onMouseDown={(e) => handleNodeMouseDown(e, nodeId)}
                          style={{ cursor: 'grab' }}
                        >
                          <rect width={w} height={h} rx={isRoot ? 10 : 7} fill={fillColor} stroke={borderColor} strokeWidth="1.5" />
                          <foreignObject width={w} height={h}>
                            <div xmlns="http://www.w3.org/1999/xhtml" style={{
                              width: `${w}px`, height: `${h}px`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              padding: '2px 6px', boxSizing: 'border-box'
                            }}>
                              <span style={{ fontSize: `${fontSize}px`, fontWeight: isRoot ? 700 : 600, color: textColor, textAlign: 'center', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {pos.label}
                              </span>
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="px-4 py-2 border-t border-[#1e293b] text-[10px] text-gray-500 text-center">
                    Drag nodes to reposition • Export SVG to share or print
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">No Mind Map data available. Click Regenerate to compile.</div>
              )}
            </div>
          )}

          {/* TAB 5: GAPS & SUGGESTIONS */}
          {activeTab === 'gaps' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Research Gaps & Missed Opportunities */}
              <div className="bg-[#121824] border border-[#1e293b] p-6 rounded-2xl space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-3">Identified Research Gaps</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {researchGaps.gaps?.map((gap, i) => (
                      <div key={i} className="p-4 bg-[#0d1321] rounded-xl border-l-4 border-amber-500 border-y border-r border-[#1e293b] text-sm text-gray-200 leading-relaxed">
                        {gap}
                      </div>
                    )) || <p className="text-sm text-gray-400">No gaps listed.</p>}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white mb-3">Missed Opportunities</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-300 pl-2">
                    {researchGaps.opportunities?.map((opp, i) => (
                      <li key={i} className="leading-relaxed">{opp}</li>
                    )) || <p className="text-sm text-gray-400">No opportunities listed.</p>}
                  </ul>
                </div>
              </div>

              {/* Proposed Follow-Up Experiments */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Suggested Follow-Up Experiments</h3>
                <div className="space-y-4">
                  {experimentSuggestions.map((exp, i) => (
                    <div key={i} className="bg-[#121824] border border-[#1e293b] p-6 rounded-2xl space-y-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-lg uppercase tracking-wider">Experiment {i+1}</span>
                        <h4 className="text-base font-bold text-white">{exp.title}</h4>
                      </div>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p><strong className="text-gray-400">Hypothesis:</strong> {exp.hypothesis}</p>
                        <p><strong className="text-gray-400">Methodology:</strong> {exp.methodology}</p>
                        <p><strong className="text-gray-400">Expected Outcome:</strong> {exp.expectedOutcome}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Research Ideas */}
              {researchIdeas.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">5 Novel Research Project Ideas</h3>
                    <button
                      onClick={() => triggerRegeneration('ideas')}
                      disabled={regenerating}
                      className="py-2 px-3 bg-[#1e293b] hover:bg-[#334155] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-gray-300 border border-[#334155]/20 disabled:opacity-55"
                    >
                      <FiRefreshCw size={12} /> Regenerate
                    </button>
                  </div>
                  <div className="space-y-4">
                    {researchIdeas.map((idea, i) => (
                      <div key={i} className="bg-[#121824] border border-[#1e293b] p-6 rounded-2xl space-y-3 shadow-xl">
                        <h4 className="text-base font-bold text-blue-400">{i+1}. {idea.title}</h4>
                        <p className="text-sm text-gray-200 leading-relaxed">{idea.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs text-gray-400 leading-relaxed">
                          <div>
                            <strong className="text-gray-300 block mb-0.5">Potential Impact:</strong>
                            {idea.potentialImpact}
                          </div>
                          <div>
                            <strong className="text-gray-300 block mb-0.5">Required Resources:</strong>
                            {idea.requiredResources}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: QA CHAT */}
          {activeTab === 'qa' && (
            <div className="bg-[#121824] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col h-[550px] overflow-hidden animate-fadeIn">
              
              {/* QA Header */}
              <div className="bg-[#0d1321] border-b border-[#1e293b] p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Grounded Q&A Agent</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Answers only grounded in paper context</p>
                </div>
                <div className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-lg border border-green-500/10">Grounded Mode</div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-none">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
                    <FiCpu className="text-4xl text-blue-500 animate-pulse" />
                    <h4 className="text-sm font-bold text-gray-300">Ask a Question about this Paper</h4>
                    <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                      Type any question below. The agent will fetch the most similar vector chunks and answer them using AI.
                    </p>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xl p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-[#0d1321] border border-[#1e293b] text-gray-200 rounded-bl-none space-y-3'
                      }`}>
                        <p>{msg.content}</p>
                        
                        {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                          <div className="border-t border-[#1e293b]/50 pt-2.5 mt-2 space-y-1.5">
                            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Retrieved Excerpt Sources:</span>
                            {msg.sources.map((src, sIdx) => (
                              <div key={sIdx} className="p-2 bg-[#121824] rounded-lg border border-[#1e293b]/50 flex items-center justify-between gap-3 text-[10px] text-gray-400 font-medium">
                                <span className="truncate max-w-[150px] font-bold text-blue-400">{src.section || 'Unknown Section'}</span>
                                <span className="text-gray-500 font-mono">Similarity: {Math.round(src.similarity * 100)}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#0d1321] border border-[#1e293b] p-4 rounded-2xl rounded-bl-none flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendQuery} className="bg-[#0d1321] border-t border-[#1e293b] p-4 flex gap-3">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  className="flex-1 py-3 px-5 bg-[#121824] border border-[#1e293b] focus:border-blue-500 rounded-xl text-sm font-semibold outline-none text-gray-200 placeholder-gray-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!chatQuery.trim() || chatLoading}
                  className="p-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center justify-center shrink-0"
                >
                  <FiSend size={16} />
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: VISUAL ASSETS - FIGURES & TABLES */}
          {activeTab === 'figures' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Visual Assets — Figures & Tables</h2>
                  <p className="text-xs text-gray-400">AI-identified figures and tables extracted from the paper, with scientific analysis.</p>
                </div>
                <button
                  onClick={() => { triggerRegeneration('figures'); }}
                  disabled={regenerating}
                  className="py-2 px-3 bg-[#1e293b] hover:bg-[#334155] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-gray-300 border border-[#334155]/20 disabled:opacity-55"
                >
                  <FiRefreshCw size={12} /> Extract Figures
                </button>
              </div>

              {figures.length > 0 ? (
                <div className="space-y-5">
                  {figures.map((fig, i) => (
                    <div key={i} className="bg-[#121824] border border-[#1e293b] p-6 rounded-2xl shadow-xl space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-lg uppercase tracking-wider shrink-0">{fig.id || `Figure ${i+1}`}</span>
                        <h4 className="text-sm font-bold text-gray-100 leading-relaxed flex-1">{fig.title || 'Untitled Figure'}</h4>
                        {paper.file.cloudinaryUrl && (
                          <button
                            onClick={() => { setPdfSearch(fig.title || fig.id); setSplitView(true); }}
                            className="py-1.5 px-3 bg-[#1e293b] hover:bg-[#334155] rounded-lg text-[10px] font-semibold text-gray-300 flex items-center gap-1 transition-all shrink-0"
                            title="Locate in PDF"
                          >
                            <FiExternalLink size={10} /> Find in PDF
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-[#0d1321] rounded-xl border border-[#1e293b] space-y-1">
                          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Description</span>
                          <p className="text-sm text-gray-200 leading-relaxed">{fig.description || 'No description available.'}</p>
                        </div>
                        <div className="p-4 bg-[#0d1321] rounded-xl border border-[#1e293b] space-y-1">
                          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Scientific Significance</span>
                          <p className="text-sm text-gray-300 leading-relaxed">{fig.analysis || 'No analysis available.'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-4">
                  <FiGrid className="text-5xl text-gray-600 mx-auto" />
                  <p className="text-gray-400 text-sm">No figures or tables have been extracted yet.</p>
                  <p className="text-gray-500 text-xs">Click "Extract Figures" to run the figure analysis agent on this paper.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: AI WRITING ASSISTANT */}
          {activeTab === 'writing' && (
            <div className="space-y-5 animate-fadeIn">

              {/* Header row */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">AI Writing Assistant</h2>
                  <p className="text-xs text-gray-400">Generate professional documents grounded in your paper — patent drafts, grant proposals, or slide decks.</p>
                </div>
                <button
                  onClick={handleRefreshDraft}
                  disabled={drafting}
                  className="py-2 px-3 bg-[#1e293b] hover:bg-[#334155] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-gray-300 border border-[#334155]/20 disabled:opacity-40 shrink-0"
                  title="Check database for latest draft"
                >
                  <FiRefreshCw size={12} /> Refresh
                </button>
              </div>

              {/* Template Selector card */}
              <div className="bg-[#121824] border border-[#1e293b] p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Document Template</span>
                  {writingStatus && (
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                      writingStatus.includes('ready') || writingStatus.includes('Copied') || writingStatus.includes('loaded')
                        ? 'bg-green-500/10 text-green-400'
                        : writingStatus.includes('Error') || writingStatus.includes('Failed')
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {writingStatus}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'slides', label: 'Slide Deck Outline', icon: '📊', desc: '9-slide presentation' },
                    { key: 'grant',  label: 'Grant Proposal',     icon: '🏛️', desc: '10-section proposal'  },
                    { key: 'patent', label: 'Patent Application', icon: '⚖️', desc: 'Formal draft + claims' }
                  ].map(({ key, label, icon, desc }) => (
                    <button
                      key={key}
                      onClick={() => { setWritingMode(key); setWritingDraft(''); setWritingStatus(''); }}
                      disabled={drafting}
                      className={`py-4 px-3 rounded-xl border font-semibold flex flex-col items-center gap-1.5 transition-all disabled:opacity-50 ${
                        writingMode === key
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/10'
                          : 'bg-[#0d1321] border-[#1e293b] text-gray-400 hover:border-[#334155] hover:text-white'
                      }`}
                    >
                      <span className="text-2xl">{icon}</span>
                      <span className="text-center text-[11px] leading-snug font-bold">{label}</span>
                      <span className="text-[9px] text-gray-500 text-center">{desc}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleDraftWriting}
                  disabled={drafting}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                  {drafting
                    ? <><FiRefreshCw size={14} className="animate-spin" /> {writingStatus || 'Generating...'}</>
                    : <><FiZap size={14} /> Generate {writingMode === 'slides' ? 'Slide Deck' : writingMode === 'grant' ? 'Grant Proposal' : 'Patent Draft'}</>
                  }
                </button>
              </div>

              {/* Draft output panel */}
              {(() => {
                const content = writingDraft || writingDrafts[writingMode] || '';
                if (content) {
                  return (
                    <div className="bg-[#121824] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
                      {/* Toolbar */}
                      <div className="bg-[#0d1321] border-b border-[#1e293b] px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full font-bold uppercase tracking-wider">Ready</span>
                          <span className="text-xs font-bold text-gray-300">
                            {writingMode === 'slides' ? '📊 Slide Deck' : writingMode === 'grant' ? '🏛️ Grant Proposal' : '⚖️ Patent Draft'}
                          </span>
                          <span className="text-[10px] text-gray-500">· {content.length.toLocaleString()} chars</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={copyDraft}
                            className="py-1.5 px-3 bg-[#1e293b] hover:bg-[#334155] rounded-lg text-[10px] font-bold text-gray-300 flex items-center gap-1.5 transition-all"
                          >
                            <FiCopy size={11} /> Copy
                          </button>
                          <button
                            onClick={downloadDraft}
                            className="py-1.5 px-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5 transition-all"
                          >
                            <FiDownload size={11} /> Save .md
                          </button>
                        </div>
                      </div>
                      {/* Editable textarea */}
                      <textarea
                        value={content}
                        onChange={(e) => setWritingDraft(e.target.value)}
                        className="w-full p-6 bg-transparent text-sm text-gray-200 font-mono leading-relaxed resize-y outline-none"
                        rows={30}
                        style={{ minHeight: '420px' }}
                        spellCheck={false}
                      />
                      <div className="px-5 py-2 border-t border-[#1e293b] text-[10px] text-gray-500 flex items-center gap-2">
                        <FiFileText size={10} /> Edit the draft above, then click Save .md to download.
                      </div>
                    </div>
                  );
                }
                if (!drafting) {
                  return (
                    <div className="text-center py-16 space-y-3">
                      <FiZap className="text-5xl text-gray-600 mx-auto" />
                      <p className="text-gray-400 text-sm font-semibold">No draft generated yet</p>
                      <p className="text-gray-500 text-xs max-w-xs mx-auto leading-relaxed">
                        Select a template and click Generate. The AI reads your full paper and produces a structured professional document.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}


        </main>
        </div>{/* /analysis panel */}
      </div>{/* /outer flex container */}
    </div>
  );
};

export default PaperDetailPage;
