// api.js - Using apiFetch helper
import { API_URL, apiFetch } from '../utils/constants';

export const authAPI = {
  checkAuth: async () => {
    try {
      return await apiFetch(`${API_URL}/auth/user`);
    } catch (err) {
      // User not authenticated
      return null;
    }
  },
  
  login: () => {
    window.location.href = `${API_URL}/auth/google`;
  },
  
  logout: () => {
    window.location.href = `${API_URL}/auth/logout`;
  }
};

export const quizAPI = {
  getAll: async (search = '') => {
    const url = search 
      ? `${API_URL}/api/quizzes?search=${encodeURIComponent(search)}` 
      : `${API_URL}/api/quizzes`;
    return await apiFetch(url);
  },
  
  getById: async (id) => {
    return await apiFetch(`${API_URL}/api/quizzes/${id}`);
  },
  
  upload: async (formData) => {
    return await apiFetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
  },
  
  create: async (quizData) => {
    return await apiFetch(`${API_URL}/api/create-quiz`, {
      method: 'POST',
      body: JSON.stringify(quizData)
    });
  },

  update: async (id, quizData) => {
    return await apiFetch(`${API_URL}/api/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quizData)
    });
  },
  
  delete: async (id) => {
    await apiFetch(`${API_URL}/api/quizzes/${id}`, {
      method: 'DELETE'
    });
    return true;
  },
  
  submit: async (quizId, answers, timeSpent) => {
    return await apiFetch(`${API_URL}/api/submit`, {
      method: 'POST',
      body: JSON.stringify({ quizId, answers, timeSpent })
    });
  },
  
  getStats: async (quizId) => {
    return await apiFetch(`${API_URL}/api/stats/${quizId}`);
  },

  parseXml: async (formData) => {
    return await apiFetch(`${API_URL}/api/parse-xml`, {
      method: 'POST',
      body: formData
    });
  }
};

export const historyAPI = {
  getAll: async () => {
    return await apiFetch(`${API_URL}/api/history`);
  },

  getAttempt: async (attemptId) => {
    return await apiFetch(`${API_URL}/api/attempts/${attemptId}`);
  }
};

export const aiAPI = {
  generateQuiz: async (config) => {
    return await apiFetch(`${API_URL}/api/ai/generate-quiz`, {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }
};