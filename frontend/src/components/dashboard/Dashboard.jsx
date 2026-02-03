import React, { useState, useEffect } from 'react';
import Card, { CardBody } from '../common/Card';
import { List, Settings } from 'lucide-react';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import QuizList from '../quiz/QuizList';
import RecentResults from './RecentResults';
import TopicStats from './TopicStats';
import SettingsModal from './SettingsModal';

const Dashboard = ({ 
  quizzes, 
  history, 
  searchTerm, 
  onSearch, 
  onStartQuiz, 
  onReviewAttempt, 
  onDeleteQuiz,
  onViewAllQuizzes,
  onViewAllResults,
  onEditQuiz
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({ showTopicStats: false });

  useEffect(() => {
    // Felhasználói beállítások betöltése
    const fetchUserPrefs = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/auth/user`, { credentials: 'include' });
        if (res.ok) {
          const user = await res.json();
          if (user.preferences) setPreferences(user.preferences);
        }
      } catch (err) { console.error(err); }
    };
    fetchUserPrefs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with "View All" button */}
      <Card>
        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white transition-colors">
                Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors">
                Elérhető tesztek és eredmények
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setShowSettings(true)}
                variant="secondary"
                size="md"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                onClick={onViewAllQuizzes}
                variant="secondary"
                size="md"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2"
              >
                <List className="w-4 h-4" />
                Összes Teszt
              </Button>
            </div>
          </div>
          
          <SearchBar
            value={searchTerm}
            onChange={onSearch}
            placeholder="Keresés címre vagy témakörre..."
          />
        </CardBody>
      </Card>

      {(preferences.showTopicStats ?? false) && <TopicStats />}

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        preferences={preferences}
        onUpdate={setPreferences}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <QuizList
          quizzes={quizzes}
          history={history}
          onStartQuiz={onStartQuiz}
          onDeleteQuiz={onDeleteQuiz}
          onEditQuiz={onEditQuiz}
        />
        
        <RecentResults
          history={history}
          onReviewAttempt={onReviewAttempt}
          onViewAllResults={onViewAllResults}
        />
      </div>
    </div>
  );
};

export default Dashboard;