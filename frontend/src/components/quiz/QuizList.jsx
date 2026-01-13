import React from 'react';
import { Clock } from 'lucide-react';
import Card, { CardBody } from '../common/Card';
import QuizCard from './QuizCard';

const QuizList = ({ quizzes, history, onStartQuiz, onDeleteQuiz }) => {
  // Get unique quiz IDs from recent history (last 5)
  const recentQuizIds = new Set(
    history
      .slice(0, 5) // Only take the 5 most recent attempts
      .map(attempt => attempt.quiz_id)
  );

  // Filter quizzes to only show those with recent attempts
  const recentQuizzes = quizzes
    .filter(quiz => recentQuizIds.has(quiz.id))
    .slice(0, 5); // Ensure max 5 quizzes

  return (
    <Card>
      <CardBody>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Nemrég Kitöltött Tesztek
        </h2>
        <div className="space-y-3">
          {recentQuizzes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Még nem töltöttél ki tesztet
            </p>
          ) : (
            recentQuizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onStart={onStartQuiz}
                onDelete={onDeleteQuiz}
              />
            ))
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default QuizList;