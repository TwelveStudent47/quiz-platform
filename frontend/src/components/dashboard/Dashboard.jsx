import React from 'react';
import Card, { CardBody } from '../common/Card';
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
  onDeleteQuiz 
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
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
          onStartQuiz={onStartQuiz}
          onDeleteQuiz={onDeleteQuiz}
        />
        
        <RecentResults
          history={history}
          onReviewAttempt={onReviewAttempt}
        />
      </div>
    </div>
  );
};

export default Dashboard;
