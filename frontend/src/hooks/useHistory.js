import { useState, useCallback } from 'react';
import { historyAPI } from '../services/api';

export const useHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await historyAPI.getAll();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    history,
    loading,
    error,
    loadHistory
  };
};
