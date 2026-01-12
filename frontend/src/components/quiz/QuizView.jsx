import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { quizAPI } from '../../services/api';
import { shuffleArray } from '../../utils/helpers';
import Card, { CardBody } from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';

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
      
      // Shuffle questions and options
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
        
        if (q.question_type === 'matching') {
          const rightItems = shuffleArray(q.question_data.pairs.map(p => p.right));
          return {
            ...q,
            question_data: {
              ...q.question_data,
              shuffledRightItems: rightItems
            }
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

  const handleSubmit = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // Process answers to match original indices
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
      const result = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          quizId: quiz.id, 
          answers: processedAnswers, 
          timeSpent 
        })
      });
      
      const data = await result.json();
      setResult(data);
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
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardBody className="p-8">
            <div className="text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Teszt Befejezve!</h2>
              <div className="text-6xl font-bold text-indigo-600 my-6">
                {Math.round(result.percentage)}%
              </div>
              <p className="text-xl text-gray-600 mb-2">
                {result.score} / {result.total_points} pont
              </p>
              <p className="text-sm text-gray-500">
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
              <h2 className="text-2xl font-bold text-gray-800">{quizData.title}</h2>
              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  <Clock className="w-5 h-5" />
                  <span className="font-bold">{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Kérdés {currentIndex + 1} / {questions.length}
            </p>
          </div>

          {/* Question */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                {currentQuestion.points} pont
              </span>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {currentQuestion.question_text}
            </h3>

            {currentQuestion.question_image && (
              <img
                src={currentQuestion.question_image}
                alt="Question"
                className="w-full max-h-96 object-contain rounded-lg border border-gray-300 mb-6"
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
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-300 hover:border-gray-400'
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
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-300 hover:border-gray-400'
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
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="font-bold text-lg">IGAZ</span>
                  </button>
                  <button
                    onClick={() => handleAnswer(currentQuestion.id, false)}
                    className={`flex-1 px-6 py-4 rounded-lg border-2 transition ${
                      answers[currentQuestion.id] === false
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
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
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {currentQuestion.question_data.unit && (
                    <p className="text-sm text-gray-500 mt-2">
                      Mértékegység: {currentQuestion.question_data.unit}
                    </p>
                  )}
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
