import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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

import { VIEWS } from './utils/constants';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { quizzes, loadQuizzes, deleteQuiz } = useQuizzes();
  const { history, loadHistory } = useHistory();
  
  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [reviewAttempt, setReviewAttempt] = useState(null);
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
      const response = await fetch(`http://localhost:5000/api/attempts/${attempt.id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to load attempt');
      }
      
      const attemptData = await response.json();
      setReviewAttempt(attemptData);
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

  const handleUploadSuccess = () => {
    loadQuizzes();
    setView(VIEWS.DASHBOARD);
  };

  const handleCreateSuccess = () => {
    loadQuizzes();
    setView(VIEWS.DASHBOARD);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            onViewAllQuizzes={handleViewAllQuizzes}  // ← ÚJ!
          />
        )}

        {view === VIEWS.UPLOAD && (
          <UploadView onUploadSuccess={handleUploadSuccess} />
        )}

        {view === VIEWS.CREATE && (
          <CreateQuizView onCreateSuccess={handleCreateSuccess} />
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
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
