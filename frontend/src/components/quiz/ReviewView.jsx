import React from 'react';
import MarkdownRenderer from '../common/MarkdownRenderer';
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

    switch (question.question_type) {
      case 'single_choice':
        return userAnswer === data.correctIndex;
      case 'multiple_choice':
        return JSON.stringify((userAnswer || []).sort()) ===
          JSON.stringify((data.correctIndices || []).sort());
      case 'true_false':
        return userAnswer === data.correctAnswer;
      case 'numeric':
        return Math.abs(parseFloat(userAnswer) - parseFloat(data.correctAnswer)) < 0.01;
      case 'matching': {
        if (!userAnswer || !data.pairs || !data.correctPairs) return false;

        let allCorrect = true;

        data.pairs.forEach((pair, pairIdx) => {
          const userRightIdx = userAnswer[pair.left];
          const correctRightIdx = data.correctPairs[pairIdx];

          if (userRightIdx === undefined || userRightIdx !== correctRightIdx) {
            allCorrect = false;
          }
        });

        return allCorrect;
      }
      case 'cloze': {
        if (!userAnswer || !data.blanks) return false;

        let correctCount = 0;
        const totalBlanks = data.blanks.length;

        data.blanks.forEach((blank, idx) => {
          const userBlankAnswer = userAnswer[idx];

          if (blank.type === 'dropdown') {
            if (userBlankAnswer === blank.correctIndex) {
              correctCount++;
            }
          } else if (blank.type === 'text') {
            const correctAnswer = blank.correctAnswer || '';
            const userTextAnswer = String(userBlankAnswer || '');

            if (blank.caseSensitive) {
              if (userTextAnswer === correctAnswer) {
                correctCount++;
              }
            } else {
              if (userTextAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
                correctCount++;
              }
            }
          }
        });

        return correctCount === totalBlanks;
      }
      case 'essay':
        return false;
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
      'matching': 'Illesztéses',
      'cloze': 'Kitöltendő',
      'essay': 'Esszé'
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">
                {attempt.quiz_title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1 transition-colors">
                Kitöltve: {formatDate(attempt.completed_at)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Summary */}
          <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors">Eredmény</p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 transition-colors">
                  {Math.round(attempt.percentage)}%
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors">Helyes válaszok</p>
                <p className="text-2xl font-semibold text-gray-800 dark:text-white transition-colors">
                  {attempt.score} / {attempt.total_points} pont
                </p>
              </div>
              {attempt.time_spent && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors">Időtartam</p>
                  <p className="text-2xl font-semibold text-gray-800 dark:text-white transition-colors">
                    {formatTime(attempt.time_spent)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Questions Review */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white transition-colors">
              Minden kérdés áttekintése
            </h3>

            {attempt.questions.map((question, idx) => {
              const userAnswer = answers[question.id];
              const data = question.question_data;
              const isCorrect = isAnswerCorrect(question, userAnswer);

              return (
                <div
                  key={question.id}
                  className={`p-6 rounded-lg border-2 transition-colors ${isCorrect
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                    }`}
                >
                  {/* Question header */}
                  <div className="flex items-start gap-3 mb-4">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="font-semibold text-gray-800 dark:text-white text-lg transition-colors flex-1">
                          <span className="mr-2 float-left">{idx + 1}.</span>
                          {question.question_type !== 'cloze' && (
                            <MarkdownRenderer content={question.question_text} />
                          )}
                          {question.question_type === 'cloze' && (
                            <span>{question.question_text}</span>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ml-2 whitespace-nowrap transition-colors ${isCorrect
                            ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                            : 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                          }`}>
                          {question.points || 1} pont
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 inline-block transition-colors">
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
                        className="w-full max-h-64 object-contain rounded-lg border border-gray-200 dark:border-gray-600"
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
                              className={`p-3 rounded-lg transition-colors ${isCorrectAnswer
                                  ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600'
                                  : isUserAnswer
                                    ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-600'
                                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span className={`flex-1 transition-colors ${isCorrectAnswer ? 'font-semibold text-green-800 dark:text-green-300' :
                                    isUserAnswer ? 'font-semibold text-red-800 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'
                                  }`}>
                                  {option}
                                </span>
                                {isCorrectAnswer && !isUserAnswer && (
                                  <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium">
                                    ✓ Helyes válasz
                                  </span>
                                )}
                                {isUserAnswer && !isCorrect && (
                                  <span className="text-xs bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-1 rounded-full font-medium">
                                    ✗ Te választottad
                                  </span>
                                )}
                                {isUserAnswer && isCorrect && (
                                  <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium">
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
                              className={`p-3 rounded-lg transition-colors ${isCorrectAnswer
                                  ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-600'
                                  : isUserAnswer
                                    ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-600'
                                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {String.fromCharCode(65 + optIdx)}.
                                </span>
                                <span className={`flex-1 transition-colors ${isCorrectAnswer ? 'font-semibold text-green-800 dark:text-green-300' :
                                    isUserAnswer ? 'font-semibold text-red-800 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'
                                  }`}>
                                  {option}
                                </span>
                                {isCorrectAnswer && !isUserAnswer && (
                                  <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium">
                                    ✓ Helyes
                                  </span>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <span className="text-xs bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 px-2 py-1 rounded-full font-medium">
                                    ✗ Rosszul választva
                                  </span>
                                )}
                                {isUserAnswer && isCorrectAnswer && (
                                  <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full font-medium">
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors">
                          Te válaszod:
                        </p>
                        <p className={`text-lg font-semibold transition-colors ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                          }`}>
                          {userAnswer === true ? 'IGAZ' : userAnswer === false ? 'HAMIS' : 'Nincs válasz'}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 transition-colors">
                            Helyes válasz: <span className="font-semibold text-green-700 dark:text-green-400">
                              {data.correctAnswer ? 'IGAZ' : 'HAMIS'}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Numeric */}
                    {question.question_type === 'numeric' && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors">
                          Te válaszod:
                        </p>
                        <p className={`text-lg font-semibold transition-colors ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                          }`}>
                          {userAnswer || 'Nincs válasz'} {data.unit || ''}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 transition-colors">
                            Helyes válasz: <span className="font-semibold text-green-700 dark:text-green-400">
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
                          let userRightIdx;

                          if (userAnswer) {
                            if (userAnswer[pair.left] !== undefined) {
                              userRightIdx = userAnswer[pair.left];
                            }
                            else if (userAnswer[pairIdx] !== undefined) {
                              userRightIdx = userAnswer[pairIdx];
                            }
                            else if (userAnswer[pairIdx.toString()] !== undefined) {
                              userRightIdx = userAnswer[pairIdx.toString()];
                            }
                          }

                          const correctRightIdx = data.correctPairs[pairIdx] ?? pairIdx;
                          const isPairCorrect = userRightIdx !== undefined && userRightIdx === correctRightIdx;

                          const userRightText = userRightIdx !== undefined && data.pairs[userRightIdx]
                            ? data.pairs[userRightIdx].right
                            : null;

                          return (
                            <div
                              key={pairIdx}
                              className={`p-4 rounded-lg border-2 transition-colors ${isPairCorrect
                                  ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600'
                                  : 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
                                }`}
                            >
                              <div className="flex items-center justify-between gap-4">
                                {/* Bal oldal + user válasz */}
                                <div className="flex items-center gap-3 flex-1">
                                  <span className="font-semibold text-gray-900 dark:text-white min-w-[120px] transition-colors">
                                    {pair.left}
                                  </span>
                                  <span className="text-2xl text-gray-400 dark:text-gray-500">→</span>
                                  <span className={`font-semibold transition-colors ${isPairCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                                    }`}>
                                    {userRightText || 'Nincs válasz'}
                                  </span>
                                </div>

                                {/* Badge */}
                                <div>
                                  {isPairCorrect ? (
                                    <span className="text-xs bg-green-600 dark:bg-green-700 text-white px-2 py-1 rounded-full font-bold">
                                      ✓ HELYES
                                    </span>
                                  ) : userRightText ? (
                                    <span className="text-xs bg-red-600 dark:bg-red-700 text-white px-2 py-1 rounded-full font-bold">
                                      ✗ ROSSZ
                                    </span>
                                  ) : (
                                    <span className="text-xs bg-gray-400 dark:bg-gray-600 text-white px-2 py-1 rounded-full font-bold">
                                      - NINCS VÁLASZ
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Helyes válasz ha rossz volt */}
                              {!isPairCorrect && (
                                <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600 transition-colors">
                                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                                    Helyes válasz:
                                    <span className="ml-2 font-bold text-green-700 dark:text-green-400">
                                      {pair.left} → {pair.right}
                                    </span>
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {question.question_type === 'cloze' && (
                      <div className="space-y-3">
                        <div className="text-base leading-relaxed mb-4">
                          {data.text.split(/(\{\d+\})/g).map((part, partIdx) => {
                            const match = part.match(/\{(\d+)\}/);

                            if (match) {
                              const blankIdx = parseInt(match[1]);
                              const blank = data.blanks[blankIdx];

                              if (!blank) return null;

                              const userBlankAnswer = userAnswer?.[blankIdx];
                              const isBlankCorrect = (() => {
                                if (blank.type === 'dropdown') {
                                  return userBlankAnswer === blank.correctIndex;
                                } else if (blank.type === 'text') {
                                  const correctAnswer = blank.correctAnswer || '';
                                  const userText = String(userBlankAnswer || '');
                                  if (blank.caseSensitive) {
                                    return userText === correctAnswer;
                                  } else {
                                    return userText.toLowerCase() === correctAnswer.toLowerCase();
                                  }
                                }
                                return false;
                              })();

                              if (blank.type === 'dropdown') {
                                const userOptionText = userBlankAnswer !== undefined && blank.options[userBlankAnswer]
                                  ? blank.options[userBlankAnswer]
                                  : '(nincs válasz)';
                                const correctOptionText = blank.options[blank.correctIndex] || '';

                                return (
                                  <span
                                    key={partIdx}
                                    className={`inline-block mx-1 px-3 py-1 rounded-lg border-2 font-semibold transition-colors ${isBlankCorrect
                                        ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600 text-green-800 dark:text-green-300'
                                        : 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-800 dark:text-red-300'
                                      }`}
                                  >
                                    {userOptionText}
                                    {!isBlankCorrect && (
                                      <span className="ml-2 text-green-700 dark:text-green-400">
                                        (helyes: {correctOptionText})
                                      </span>
                                    )}
                                  </span>
                                );
                              } else if (blank.type === 'text') {
                                const userText = userBlankAnswer || '(üres)';
                                const correctText = blank.correctAnswer || '';

                                return (
                                  <span
                                    key={partIdx}
                                    className={`inline-block mx-1 px-3 py-1 rounded-lg border-2 font-semibold transition-colors ${isBlankCorrect
                                        ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600 text-green-800 dark:text-green-300'
                                        : 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-800 dark:text-red-300'
                                      }`}
                                  >
                                    {userText}
                                    {!isBlankCorrect && (
                                      <span className="ml-2 text-green-700 dark:text-green-400">
                                        (helyes: {correctText})
                                      </span>
                                    )}
                                  </span>
                                );
                              }
                            }

                            return <span key={partIdx} className="text-gray-800 dark:text-gray-200">{part}</span>;
                          })}
                        </div>
                      </div>
                    )}

                    {/* Essay Question */}
                    {question.question_type === 'essay' && (
                      <div className="space-y-3">
                        {/* User's answer */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                            📝 Te válaszod:
                          </p>
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 transition-colors">
                              {userAnswer?.text || '(Nincs válasz)'}
                            </p>
                          </div>

                          {userAnswer?.wordCount && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 transition-colors">
                              Szavak száma: <span className="font-semibold">{userAnswer.wordCount}</span>
                            </p>
                          )}
                        </div>

                        {/* Manual grading notice */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700 transition-colors">
                          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-1 transition-colors">
                            ⏳ Manuális értékelésre vár
                          </p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-500 transition-colors">
                            Ez a kérdés tanári értékelést igényel. A pontszám később kerül megadásra.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  {question.question_explanation && (
                    <div className="ml-9 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1 transition-colors">
                        💡 Magyarázat:
                      </p>
                      <div className="text-sm text-blue-800 dark:text-blue-400 transition-colors">
                        <MarkdownRenderer content={question.question_explanation} />
                      </div>
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