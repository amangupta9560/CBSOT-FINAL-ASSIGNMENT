import { useState } from 'react';
import api from '../Utils/api';

const usePaper = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Upload Paper
  const uploadPaper = async (file, tags = [], projectId = null) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tags', JSON.stringify(tags));
      if (projectId) {
        formData.append('projectId', projectId);
      }

      const response = await api.post('/papers/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Papers List
  const fetchPapers = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { status, isBookmarked, search, page = 1, limit = 12 } = filters;
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (isBookmarked !== undefined) params.append('isBookmarked', isBookmarked);
      if (search) params.append('search', search);
      params.append('page', page);
      params.append('limit', limit);

      const response = await api.get(`/papers?${params.toString()}`);
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Single Paper by ID
  const fetchPaperById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/papers/${id}`);
      return response.data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 4. Delete Paper
  const deletePaper = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/papers/${id}`);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 5. Toggle Bookmark
  const toggleBookmark = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/papers/${id}/bookmark`);
      return response.data.isBookmarked;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 6. Update Tags
  const updateTags = async (id, tags) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/papers/${id}/tags`, { tags });
      return response.data.tags;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 7. Get Status
  const getPaperStatus = async (id) => {
    try {
      const response = await api.get(`/papers/${id}/status`);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    loading,
    error,
    uploadPaper,
    fetchPapers,
    fetchPaperById,
    deletePaper,
    toggleBookmark,
    updateTags,
    getPaperStatus,
  };
};

export default usePaper;
