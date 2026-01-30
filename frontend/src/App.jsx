import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useQuizzes } from './hooks/useQuizzes';
import { useHistory } from './hooks/useHistory';
import { quizAPI } from './services/api';

import LoginPage from './components/auth/LoginPage';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import UploadView from './components/upload/UploadView';
import CreateQuizView from './components/quiz/CreateQuizView';
import QuizView from './components/quiz/QuizView';
import ReviewView from './components/quiz/ReviewView';
import LoadingSpinner from './components/common/LoadingSpinner';
import AllQuizzesView from './components/quiz/AllQuizzesView';
import AllResultsView from './components/results/AllResultsView';

import { API_URL, VIEWS, apiFetch } from './utils/constants';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { quizzes, loadQuizzes, deleteQuiz } = useQuizzes();
  const { history, loadHistory } = useHistory();
  
  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [reviewAttempt, setReviewAttempt] = useState(null);
  const [editQuiz, setEditQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadQuizzes();
      loadHistory();
    }
  }, [user, loadQuizzes, loadHistory]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    loadQuizzes(term);
  };

  const handleStartQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setView(VIEWS.QUIZ);
  };

  const handleQuizComplete = () => {
    setView(VIEWS.DASHBOARD);
    setCurrentQuiz(null);
    loadHistory();
  };

  const handleReviewAttempt = async (attempt) => {
    try {
      const data = await apiFetch(`${API_URL}/api/attempts/${attempt.id}`);
      
      setReviewAttempt(data);  // ← data = parsed JSON!
      setView(VIEWS.REVIEW);
    } catch (err) {
      console.error('Failed to load attempt for review:', err);
      alert('Hiba történt az eredmények betöltése során');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    const success = await deleteQuiz(quizId);
    if (success) {
      alert('Teszt sikeresen törölve!');
      loadHistory();
    } else {
      alert('Hiba történt a törlés során');
    }
  };

  const handleViewAllQuizzes = () => {
    setView(VIEWS.ALL_QUIZZES);
  };

  const handleViewAllResults = () => {
    setView(VIEWS.ALL_RESULTS);
  };

  const handleEditQuiz = async (quiz) => {
    try {
      const quizData = await quizAPI.getById(quiz.id);
      setEditQuiz(quizData);
      setView(VIEWS.EDIT);
    } catch (err) {
      console.error('Failed to load quiz for editing:', err);
      alert('Hiba történt a teszt betöltése során');
    }
  };

  const handleUploadSuccess = () => {
    loadQuizzes();
    setView(VIEWS.DASHBOARD);
  };

  const handleLoadToEditor = (quizData) => {
    console.log('📝 Loading to editor from XML:', quizData);
    
    setEditQuiz({
      isNew: true,
      quiz: {
        title: quizData.title,
        topic: quizData.topic,
        description: quizData.description,
        time_limit: quizData.timeLimit
      },
      questions: quizData.questions
    });
    
    setView(VIEWS.CREATE);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header currentView={view} onViewChange={setView} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {view === VIEWS.DASHBOARD && (
          <Dashboard
            quizzes={quizzes}
            history={history}
            searchTerm={searchTerm}
            onSearch={handleSearch}
            onStartQuiz={handleStartQuiz}
            onReviewAttempt={handleReviewAttempt}
            onDeleteQuiz={handleDeleteQuiz}
            onViewAllQuizzes={handleViewAllQuizzes}
            onViewAllResults={handleViewAllResults}
            onEditQuiz={handleEditQuiz}
          />
        )}

        {view === VIEWS.UPLOAD && (
          <UploadView
            onUploadSuccess={handleUploadSuccess}
            onLoadToEditor={handleLoadToEditor}
          />
        )}

        {view === VIEWS.CREATE && (
          <CreateQuizView
            editQuiz={editQuiz}
            onCreateSuccess={() => {
              loadQuizzes();
              setView(VIEWS.DASHBOARD);
              setEditQuiz(null);
            }}
          />
        )}

        {view === VIEWS.EDIT && editQuiz && (
          <CreateQuizView 
            editQuiz={editQuiz} 
            onCreateSuccess={() => {
              loadQuizzes();
              setView(VIEWS.DASHBOARD);
              setEditQuiz(null);
            }}
          />
        )}

        {view === VIEWS.QUIZ && currentQuiz && (
          <QuizView quiz={currentQuiz} onComplete={handleQuizComplete} />
        )}

        {view === VIEWS.REVIEW && reviewAttempt && (
          <ReviewView
            attempt={reviewAttempt}
            onClose={() => {
              setView(VIEWS.DASHBOARD);
              setReviewAttempt(null);
            }}
          />
        )}

        {view === VIEWS.ALL_QUIZZES && (
          <AllQuizzesView
            onBack={() => setView(VIEWS.DASHBOARD)}
            onStartQuiz={handleStartQuiz}
            onEditQuiz={handleEditQuiz}
          />
        )}

        {view === VIEWS.ALL_RESULTS && (
          <AllResultsView
            onBack={() => setView(VIEWS.DASHBOARD)}
            onReviewAttempt={handleReviewAttempt}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}