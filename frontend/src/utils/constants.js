export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const API_KEY = process.env.REACT_APP_API_KEY || 'dev-key-123';

// Helper function to add API key to fetch requests
export const apiFetch = async (url, options = {}) => {
  const headers = {
    'X-API-Key': API_KEY,
    ...options.headers
  };

  // Only add Content-Type for JSON (NOT for FormData!)
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API call failed: ${response.statusText}`);
  }

  return response.json();
};

export const AVATAR_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-cyan-500'
];

export const VIEWS = {
  DASHBOARD: 'dashboard',
  UPLOAD: 'upload',
  CREATE: 'create',
  QUIZ: 'quiz',
  REVIEW: 'review',
  ALL_QUIZZES: 'all-quizzes',
  ALL_RESULTS: 'all-results',
  EDIT: 'edit'
};