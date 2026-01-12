import React from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import Card, { CardBody } from '../common/Card';
import Button from '../common/Button';

const ReviewView = ({ attempt, onClose }) => {
  const answers = typeof attempt.answers === 'string' 
    ? JSON.parse(attempt.answers) 
    : attempt.answers;
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('hu-HU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isAnswerCorrect = (question, userAnswer) => {
    const data = question.question_data;
    
    switch(question.question_type) {
      case 'single_choice':
        return userAnswer === data.correctIndex;
      case 'multiple_choice':
        return JSON.stringify((userAnswer || []).sort()) === 
               JSON.stringify((data.correctIndices || []).sort());
      case 'true_false':
        return userAnswer === data.correctAnswer;
      case 'numeric':
        return Math.abs(parseFloat(userAnswer) - parseFloat(data.correctAnswer)) < 0.01;
      case 'matching':
        return JSON.stringify(userAnswer) === JSON.stringify(data.correctPairs);
      default:
        return false;
    }
  };

  const getQuestionTypeLabel = (type) => {
    const labels = {
      'single_choice': 'Egy válaszos',
      'multiple_choice': 'Több válaszos',
      'true_false': 'Igaz/Hamis',
      'numeric': 'Számos',
      'matching': 'Illesztéses'
    };
    return labels[type] || type;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardBody className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{attempt.quiz_title}</h2>
              <p className="text-gray-600 mt-1">
                Kitöltve: {formatDate(attempt.completed_at)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Summary */}
          <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Eredmény</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {Math.round(attempt.percentage)}%
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Helyes válaszok</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {attempt.score} / {attempt.total_points} pont
                </p>
              </div>
              {attempt.time_spent && (
                <div>
                  <p className="text-gray-600 text-sm">Időtartam</p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {formatTime(attempt.time_spent)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Questions Review */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Minden kérdés áttekintése</h3>
            
            {attempt.questions.map((question, idx) => {
              const userAnswer = answers[question.id];
              const data = question.question_data;
              const isCorrect = isAnswerCorrect(question, userAnswer);
              
              return (
                <div 
                  key={question.id} 
                  className={`p-6 rounded-lg border-2 ${
                    isCorrect 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  {/* Question header */}
                  <div className="flex items-start gap-3 mb-4">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <p className="font-semibold text-gray-800 text-lg">
                          {idx + 1}. {question.question_text}
                        </p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ml-2 whitespace-nowrap ${
                          isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                        }`}>
                          {question.question_points || 1} pont
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 inline-block">
                        Típus: {getQuestionTypeLabel(question.question_type)}
                      </span>
                    </div>
                  </div>

                  {/* Question image */}
                  {question.question_image && (
                    <div className="mb-4 ml-9">
                      <img 
                        src={question.question_image} 
                        alt="Question" 
                        className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {/* Answer display based on type */}
                  <div className="ml-9">
                    {/* Single Choice */}
                    {question.question_type === 'single_choice' && (
                      <div className="space-y-2">
                        {data.options.map((option, optIdx) => {
                          const isUserAnswer = userAnswer === optIdx;
                          const isCorrectAnswer = data.correctIndex === optIdx;
                          
                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-lg ${
                                isCorrectAnswer 
                                  ? 'bg-green-100 border-2 border-green-300' 
                                  : isUserAnswer 
                                  ? 'bg-red-100 border-2 border-red-300'
                                  : 'bg-white border border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span className={`flex-1 ${
                                  isCorrectAnswer ? 'font-semibold text-green-800' : 
                                  isUserAnswer ? 'font-semibold text-red-800' : 'text-gray-700'
                                }`}>
                                  {option}
                                </span>
                                {isCorrectAnswer && !isUserAnswer && (
                                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
                                    ✓ Helyes válasz
                                  </span>
                                )}
                                {isUserAnswer && !isCorrect && (
                                  <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full font-medium">
                                    ✗ Te választottad
                                  </span>
                                )}
                                {isUserAnswer && isCorrect && (
                                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
                                    ✓ Te választottad (Helyes!)
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Multiple Choice */}
                    {question.question_type === 'multiple_choice' && (
                      <div className="space-y-2">
                        {data.options.map((option, optIdx) => {
                          const isUserAnswer = (userAnswer || []).includes(optIdx);
                          const isCorrectAnswer = (data.correctIndices || []).includes(optIdx);
                          
                          return (
                            <div
                              key={optIdx}
                              className={`p-3 rounded-lg ${
                                isCorrectAnswer 
                                  ? 'bg-green-100 border-2 border-green-300' 
                                  : isUserAnswer 
                                  ? 'bg-red-100 border-2 border-red-300'
                                  : 'bg-white border border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span className={`flex-1 ${
                                  isCorrectAnswer ? 'font-semibold text-green-800' : 
                                  isUserAnswer ? 'font-semibold text-red-800' : 'text-gray-700'
                                }`}>
                                  {option}
                                </span>
                                {isCorrectAnswer && !isUserAnswer && (
                                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
                                    ✓ Helyes
                                  </span>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full font-medium">
                                    ✗ Rosszul választva
                                  </span>
                                )}
                                {isUserAnswer && isCorrectAnswer && (
                                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
                                    ✓ Helyesen választva
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* True/False */}
                    {question.question_type === 'true_false' && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Te válaszod:</p>
                        <p className={`text-lg font-semibold ${
                          isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {userAnswer === true ? 'IGAZ' : userAnswer === false ? 'HAMIS' : 'Nincs válasz'}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-gray-600 mt-2">
                            Helyes válasz: <span className="font-semibold text-green-700">
                              {data.correctAnswer ? 'IGAZ' : 'HAMIS'}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Numeric */}
                    {question.question_type === 'numeric' && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Te válaszod:</p>
                        <p className={`text-lg font-semibold ${
                          isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {userAnswer || 'Nincs válasz'} {data.unit || ''}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-gray-600 mt-2">
                            Helyes válasz: <span className="font-semibold text-green-700">
                              {data.correctAnswer} {data.unit || ''}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Matching */}
                    {question.question_type === 'matching' && (
                      <div className="space-y-2">
                        {data.pairs.map((pair, pairIdx) => {
                          const userRightIdx = userAnswer?.[pairIdx];
                          const correctRightIdx = data.correctPairs[pairIdx];
                          const isPairCorrect = userRightIdx === correctRightIdx;
                          
                          return (
                            <div
                              key={pairIdx}
                              className={`p-3 rounded-lg ${
                                isPairCorrect 
                                  ? 'bg-green-100 border-2 border-green-300' 
                                  : 'bg-red-100 border-2 border-red-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{pair.left}</span>
                                <span>→</span>
                                <span className={isPairCorrect ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                                  {data.pairs[userRightIdx]?.right || 'Nincs válasz'}
                                </span>
                              </div>
                              {!isPairCorrect && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Helyes: <span className="text-green-700 font-semibold">
                                    {pair.right}
                                  </span>
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  {question.question_explanation && (
                    <div className="ml-9 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-semibold text-blue-900 mb-1">💡 Magyarázat:</p>
                      <p className="text-sm text-blue-800">{question.question_explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Close button */}
          <div className="mt-8">
            <Button
              onClick={onClose}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Vissza a Dashboard-ra
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ReviewView;
