import { API_URL } from '../utils/constants';

const fetchWithCredentials = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });
  
  if (!response.ok && response.status !== 404) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  
  return response;
};

// Auth API
export const authAPI = {
  checkAuth: async () => {
    const response = await fetchWithCredentials(`${API_URL}/auth/user`);
    if (response.ok) {
      return response.json();
    }
    return null;
  },
  
  login: () => {
    window.location.href = `${API_URL}/auth/google`;
  },
  
  logout: () => {
    window.location.href = `${API_URL}/auth/logout`;
  }
};

// Quiz API
export const quizAPI = {
  getAll: async (search = '') => {
    const url = search 
      ? `${API_URL}/api/quizzes?search=${encodeURIComponent(search)}` 
      : `${API_URL}/api/quizzes`;
    const response = await fetchWithCredentials(url);
    return response.json();
  },
  
  getById: async (id) => {
    const response = await fetchWithCredentials(`${API_URL}/api/quizzes/${id}`);
    return response.json();
  },
  
  upload: async (formData) => {
    const response = await fetchWithCredentials(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  },
  
  create: async (quizData) => {
    const response = await fetchWithCredentials(`${API_URL}/api/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quizData)
    });
    return response.json();
  },
  
  delete: async (id) => {
    const response = await fetchWithCredentials(`${API_URL}/api/quizzes/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  },
  
  submit: async (quizId, answers) => {
    const response = await fetchWithCredentials(`${API_URL}/api/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ quizId, answers })
    });
    return response.json();
  },
  
  getStats: async (quizId) => {
    const response = await fetchWithCredentials(`${API_URL}/api/stats/${quizId}`);
    return response.json();
  }
};

// History API
export const historyAPI = {
  getAll: async () => {
    const response = await fetchWithCredentials(`${API_URL}/api/history`);
    return response.json();
  }
};
