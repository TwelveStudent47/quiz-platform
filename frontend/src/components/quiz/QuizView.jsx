import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Trophy, Star, Frown, Meh } from 'lucide-react';
import { quizAPI } from '../../services/api';
import { shuffleArray } from '../../utils/helpers';
import Card, { CardBody } from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { API_URL, apiFetch } from '../../utils/constants';

const QuizView = ({ quiz, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuiz();
  }, []);

  useEffect(() => {
    if (quizData?.time_limit && timeRemaining === null) {
      setTimeRemaining(quizData.time_limit * 60);
    }
  }, [quizData]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || result) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, result]);

  const loadQuiz = async () => {
    try {
      const data = await quizAPI.getById(quiz.id);
      setQuizData(data.quiz);

      const shuffledQuestions = shuffleArray(data.questions).map(q => {
        if (q.question_type === 'single_choice' || q.question_type === 'multiple_choice') {
          const optionsWithIndex = q.question_data.options.map((opt, idx) => ({ 
            option: opt, 
            originalIndex: idx 
          }));
          const shuffledOptions = shuffleArray(optionsWithIndex);
          
          return {
            ...q,
            question_data: {
              ...q.question_data,
              options: shuffledOptions.map(item => item.option),
              shuffledOptions: shuffledOptions
            },
            originalOptions: q.question_data.options
          };
        }
        
        return q;
      });
      
      setQuestions(shuffledQuestions);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load quiz:', err);
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleMultipleAnswer = (questionId, optionIndex) => {
    const currentAnswers = answers[questionId] || [];
    const newAnswers = currentAnswers.includes(optionIndex)
      ? currentAnswers.filter(i => i !== optionIndex)
      : [...currentAnswers, optionIndex];
    setAnswers({ ...answers, [questionId]: newAnswers });
  };

  const handleMatchingAnswer = (questionId, leftItem, rightIndex) => {
    const currentMatching = answers[questionId] || {};
    setAnswers({
      ...answers,
      [questionId]: {
        ...currentMatching,
        [leftItem]: rightIndex
      }
    });
  };

  const handleSubmit = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    const processedAnswers = {};
    questions.forEach(q => {
      if (answers[q.id] !== undefined) {
        if (q.question_type === 'single_choice' && q.originalOptions) {
          const selectedOption = q.question_data.options[answers[q.id]];
          processedAnswers[q.id] = q.originalOptions.indexOf(selectedOption);
        } else if (q.question_type === 'multiple_choice' && q.originalOptions) {
          const selectedIndices = answers[q.id] || [];
          processedAnswers[q.id] = selectedIndices.map(idx => {
            const selectedOption = q.question_data.options[idx];
            return q.originalOptions.indexOf(selectedOption);
          });
        } else {
          processedAnswers[q.id] = answers[q.id];
        }
      }
    });
    
    try {
      const result = await apiFetch(`${API_URL}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          quizId: quiz.id, 
          answers: processedAnswers, 
          timeSpent 
        })
      });
      
      setResult(result);
    } catch (err) {
      console.error('Failed to submit:', err);
      alert('Hiba történt a beküldés során');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (result) {
    const percentage = Math.round(result.percentage);

    const getResultIcon = () => {
      if (percentage >= 90) {
        return {
          icon: Trophy,
          color: 'text-yellow-500 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
          message: 'Kiváló teljesítmény! 🎉'
        };
      } else if (percentage >= 80) {
        return {
          icon: Star,
          color: 'text-green-500 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          message: 'Nagyon jó munka! ⭐'
        };
      } else if (percentage >= 70) {
        return {
          icon: CheckCircle,
          color: 'text-green-500 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          message: 'Jó teljesítmény! ✓'
        };
      } else if (percentage >= 50) {
        return {
          icon: Meh,
          color: 'text-orange-500 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/30',
          message: 'Még van mit fejlődni! 💪'
        };
      } else {
        return {
          icon: Frown,
          color: 'text-red-500 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          message: 'Ne add fel, próbáld újra! 🔄'
        };
      }
    };
    
    const resultIcon = getResultIcon();
    const ResultIcon = resultIcon.icon;
    
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardBody className="p-8">
            <div className="text-center">
              {/* Dinamikus ikon színes háttérrel */}
              <div className={`inline-flex items-center justify-center w-24 h-24 ${resultIcon.bgColor} rounded-full mb-4 transition-colors`}>
                <ResultIcon className={`w-16 h-16 ${resultIcon.color}`} />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 transition-colors">
                Teszt Befejezve!
              </h2>
              
              {/* Üzenet */}
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 transition-colors">
                {resultIcon.message}
              </p>
              
              {/* Százalék - dinamikus szín */}
              <div className={`text-6xl font-bold my-6 ${resultIcon.color} transition-colors`}>
                {percentage}%
              </div>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-2 transition-colors">
                {result.score} / {result.total_points} pont
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 transition-colors">
                Eltelt idő: {Math.floor(result.time_spent / 60)} perc {result.time_spent % 60} másodperc
              </p>
              
              <div className="mt-8 space-y-3">
                <Button
                  onClick={onComplete}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Vissza a Dashboard-ra
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardBody className="p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white transition-colors">
                {quizData.title}
              </h2>
              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  timeRemaining < 60 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}>
                  <Clock className="w-5 h-5" />
                  <span className="font-bold">{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 transition-colors">
              Kérdés {currentIndex + 1} / {questions.length}
            </p>
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-medium transition-colors">
                {currentQuestion.points} pont
              </span>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 transition-colors">
              {currentQuestion.question_type === 'cloze' 
                ? ''
                : currentQuestion.question_text
              }
            </h3>

            {currentQuestion.question_image && (
              <img
                src={currentQuestion.question_image}
                alt="Question"
                className="w-full max-h-96 object-contain rounded-lg border border-gray-300 dark:border-gray-600 mb-6 transition-colors"
              />
            )}

            {/* Answer options based on question type */}
            <div className="space-y-3">
              {currentQuestion.question_type === 'single_choice' && (
                <div className="space-y-2">
                  {currentQuestion.question_data.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(currentQuestion.id, idx)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                        answers[currentQuestion.id] === idx
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-gray-900 dark:text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.question_type === 'multiple_choice' && (
                <div className="space-y-2">
                  {currentQuestion.question_data.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleMultipleAnswer(currentQuestion.id, idx)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                        (answers[currentQuestion.id] || []).includes(idx)
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-gray-900 dark:text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(answers[currentQuestion.id] || []).includes(idx)}
                        onChange={() => {}}
                        className="mr-3"
                      />
                      <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.question_type === 'true_false' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAnswer(currentQuestion.id, true)}
                    className={`flex-1 px-6 py-4 rounded-lg border-2 transition ${
                      answers[currentQuestion.id] === true
                        ? 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <span className="font-bold text-lg">IGAZ</span>
                  </button>
                  <button
                    onClick={() => handleAnswer(currentQuestion.id, false)}
                    className={`flex-1 px-6 py-4 rounded-lg border-2 transition ${
                      answers[currentQuestion.id] === false
                        ? 'border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <span className="font-bold text-lg">HAMIS</span>
                  </button>
                </div>
              )}

              {currentQuestion.question_type === 'numeric' && (
                <div>
                  <input
                    type="number"
                    step="any"
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                    placeholder="Írd be a választ"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  />
                  {currentQuestion.question_data.unit && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 transition-colors">
                      Mértékegység: {currentQuestion.question_data.unit}
                    </p>
                  )}
                </div>
              )}

              {currentQuestion.question_type === 'matching' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors">
                    Válaszd ki minden bal oldali elemhez a megfelelő jobb oldali párt!
                  </p>
                  {currentQuestion.question_data.pairs.map((pair, pairIdx) => {
                    const userMatch = answers[currentQuestion.id]?.[pair.left];
                    const rightItems = currentQuestion.question_data.shuffledRightItems || 
                                      currentQuestion.question_data.pairs.map(p => p.right);
                    
                    return (
                      <div key={pairIdx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
                        <div className="flex items-center gap-4">
                          {/* Left item */}
                          <div className="flex-1 font-semibold text-gray-800 dark:text-white transition-colors">
                            {pair.left}
                          </div>
                          
                          {/* Arrow */}
                          <div className="text-gray-400 dark:text-gray-500">
                            →
                          </div>
                          
                          {/* Right items dropdown */}
                          <div className="flex-1">
                            <select
                              value={userMatch !== undefined ? userMatch : ''}
                              onChange={(e) => handleMatchingAnswer(
                                currentQuestion.id, 
                                pair.left, 
                                e.target.value === '' ? undefined : parseInt(e.target.value)
                              )}
                              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                            >
                              <option value="">-- Válassz --</option>
                              {rightItems.map((rightItem, rightIdx) => (
                                <option key={rightIdx} value={rightIdx}>
                                  {rightItem}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentQuestion.question_type === 'cloze' && (
                <div className="space-y-4">
                  <div className="text-base leading-relaxed text-gray-800 dark:text-gray-200 transition-colors">
                    {currentQuestion.question_data.text.split(/(\{\d+\})/g).map((part, idx) => {
                      const match = part.match(/\{(\d+)\}/);
                      
                      if (match) {
                        const blankIdx = parseInt(match[1]);
                        const blank = currentQuestion.question_data.blanks[blankIdx];
                        
                        if (!blank) return null;
                        
                        const currentAnswer = answers[currentQuestion.id]?.[blankIdx];
                        
                        if (blank.type === 'dropdown') {
                          return (
                            <select
                              key={idx}
                              value={currentAnswer !== undefined ? currentAnswer : ''}
                              onChange={(e) => {
                                const newAnswers = { ...(answers[currentQuestion.id] || {}) };
                                newAnswers[blankIdx] = e.target.value === '' ? undefined : parseInt(e.target.value);
                                handleAnswer(currentQuestion.id, newAnswers);
                              }}
                              className="inline-block mx-1 px-3 py-1 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                            >
                              <option value="">--</option>
                              {blank.options.map((opt, optIdx) => (
                                <option key={optIdx} value={optIdx}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          );
                        } else if (blank.type === 'text') {
                          return (
                            <input
                              key={idx}
                              type="text"
                              value={currentAnswer || ''}
                              onChange={(e) => {
                                const newAnswers = { ...(answers[currentQuestion.id] || {}) };
                                newAnswers[blankIdx] = e.target.value;
                                handleAnswer(currentQuestion.id, newAnswers);
                              }}
                              placeholder="..."
                              className="inline-block mx-1 px-3 py-1 w-32 border-2 border-indigo-300 dark:border-indigo-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
                            />
                          );
                        }
                      }
                      
                      return <span key={idx}>{part}</span>;
                    })}
                  </div>
                </div>
              )}

              {currentQuestion.question_type === 'essay' && (
                <div className="space-y-4">
                  {/* Instructions */}
                  {(currentQuestion.question_data.minWordLimit || currentQuestion.question_data.maxWordLimit) && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700 transition-colors">
                      <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1 transition-colors">
                        📝 Követelmények:
                      </p>
                      {currentQuestion.question_data.minWordLimit && (
                        <p>• Minimum {currentQuestion.question_data.minWordLimit} szó</p>
                      )}
                      {currentQuestion.question_data.maxWordLimit && (
                        <p>• Maximum {currentQuestion.question_data.maxWordLimit} szó</p>
                      )}
                    </div>
                  )}

                  {/* Textarea */}
                  <div>
                    <textarea
                      value={answers[currentQuestion.id]?.text || ''}
                      onChange={(e) => {
                        const text = e.target.value;
                        const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
                        
                        handleAnswer(currentQuestion.id, {
                          text: text,
                          wordCount: wordCount
                        });
                      }}
                      placeholder="Írd ide a válaszod..."
                      rows={currentQuestion.question_data.responseFieldLines || 15}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent resize-y font-sans bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    />
                    
                    {/* Word count */}
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <p className="text-gray-600 dark:text-gray-400 transition-colors">
                        Szavak száma: <span className="font-semibold">
                          {answers[currentQuestion.id]?.wordCount || 0}
                        </span>
                      </p>
                      
                      {/* Warning for limits */}
                      {currentQuestion.question_data.minWordLimit && 
                       (answers[currentQuestion.id]?.wordCount || 0) < currentQuestion.question_data.minWordLimit && (
                        <p className="text-orange-600 dark:text-orange-400 font-medium transition-colors">
                          ⚠️ Minimum {currentQuestion.question_data.minWordLimit} szó szükséges
                        </p>
                      )}
                      
                      {currentQuestion.question_data.maxWordLimit && 
                       (answers[currentQuestion.id]?.wordCount || 0) > currentQuestion.question_data.maxWordLimit && (
                        <p className="text-red-600 dark:text-red-400 font-medium transition-colors">
                          ❌ Maximum {currentQuestion.question_data.maxWordLimit} szó engedélyezett
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between gap-4">
            <Button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              variant="secondary"
            >
              Előző
            </Button>
            
            {currentIndex < questions.length - 1 ? (
              <Button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                variant="primary"
              >
                Következő
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="success"
                disabled={Object.keys(answers).length === 0}
              >
                Beküldés
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default QuizView;