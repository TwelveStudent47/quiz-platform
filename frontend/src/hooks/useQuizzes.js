import { useState, useCallback } from 'react';
import { quizAPI } from '../services/api';

export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadQuizzes = useCallback(async (searchTerm = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await quizAPI.getAll(searchTerm);
      setQuizzes(data);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteQuiz = useCallback(async (quizId) => {
    try {
      const success = await quizAPI.delete(quizId);
      if (success) {
        setQuizzes(prev => prev.filter(q => q.id !== quizId));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      setError(err.message);
      return false;
    }
  }, []);

  const uploadQuiz = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await quizAPI.upload(formData);
      await loadQuizzes(); // Refresh the list
      return result;
    } catch (err) {
      console.error('Failed to upload quiz:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadQuizzes]);

  const createQuiz = useCallback(async (quizData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await quizAPI.create(quizData);
      await loadQuizzes(); // Refresh the list
      return result;
    } catch (err) {
      console.error('Failed to create quiz:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadQuizzes]);

  return {
    quizzes,
    loading,
    error,
    loadQuizzes,
    deleteQuiz,
    uploadQuiz,
    createQuiz
  };
};
