import { useState } from 'react';
import api from '../Utils/api';

/**
 * Custom hook to manage Grounded QA Chat states and requests
 * @param {string} paperId - The ID of the paper being queried
 */
const useChat = (paperId) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (queryText, userId = null) => {
    if (!queryText.trim()) return;
    
    const userMsg = { role: 'user', content: queryText };
    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const params = { query: queryText };
      if (userId) {
        params.userId = userId;
      }
      
      const res = await api.get(`/papers/${paperId}/query`, { params });
      
      const assistantMsg = {
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources,
        confidence: res.data.confidence
      };
      setChatHistory(prev => [...prev, assistantMsg]);
      return assistantMsg;
    } catch (err) {
      console.error('QA Chat Error:', err);
      const errorMsg = {
        role: 'assistant',
        content: 'Sorry, I encountered an error searching this paper.'
      };
      setChatHistory(prev => [...prev, errorMsg]);
      setError(err.message || 'Error occurred during query.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setError(null);
  };

  return {
    chatHistory,
    setChatHistory,
    loading,
    error,
    sendMessage,
    clearChat
  };
};

export default useChat;
