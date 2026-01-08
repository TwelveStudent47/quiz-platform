import React from 'react';
import { BookOpen } from 'lucide-react';
import Card, { CardBody } from '../common/Card';
import QuizCard from './QuizCard';

const QuizList = ({ quizzes, onStartQuiz, onDeleteQuiz }) => {
  return (
    <Card>
      <CardBody>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Tesztjeim
        </h2>
        <div className="space-y-3">
          {quizzes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Még nincs feltöltött teszt</p>
          ) : (
            quizzes.map((quiz) => (
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
