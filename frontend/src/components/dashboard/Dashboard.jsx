import React from 'react';
import Card, { CardBody } from '../common/Card';
import { List } from 'lucide-react';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import QuizList from '../quiz/QuizList';
import RecentResults from './RecentResults';

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
  return (
    <div className="space-y-6">
      {/* Header with "View All" button */}
      <Card>
        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Elérhető tesztek és eredmények
              </p>
            </div>
            <Button
              onClick={onViewAllQuizzes}
              variant="secondary"
              size="md"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <List className="w-4 h-4" />
              Összes Teszt
            </Button>
          </div>
          
          <SearchBar
            value={searchTerm}
            onChange={onSearch}
            placeholder="Keresés címre vagy témakörre..."
          />
        </CardBody>
      </Card>

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
