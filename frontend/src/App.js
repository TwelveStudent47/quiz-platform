import React, { useState, useEffect } from 'react';
import { Search, Upload, BookOpen, TrendingUp, Clock, CheckCircle, X, LogOut, Eye, XCircle, Plus, Trash2, Edit3 } from 'lucide-react';

const API_URL = 'http://localhost:5000';

export default function QuizPlatform() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [reviewAttempt, setReviewAttempt] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/user`, { credentials: 'include' });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        loadQuizzes();
        loadHistory();
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    }
  };

  const getAvatarColor = (name) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-cyan-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const loadQuizzes = async (search = '') => {
    try {
      const url = search ? `${API_URL}/api/quizzes?search=${search}` : `${API_URL}/api/quizzes`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      setQuizzes(data);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/history`, { credentials: 'include' });
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleLogout = () => {
    window.location.href = `${API_URL}/auth/logout`;
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    loadQuizzes(term);
  };

  const handleReviewAttempt = async (attempt) => {
    try {
      const res = await fetch(`${API_URL}/api/quizzes/${attempt.quiz_id}`, { credentials: 'include' });
      const data = await res.json();
      setReviewAttempt({
        ...attempt,
        questions: data.questions
      });
      setView('review');
    } catch (err) {
      console.error('Failed to load quiz for review:', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <BookOpen className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Platform</h1>
          <p className="text-gray-600 mb-6">Tanulj okosabban, ne keményebben</p>
          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Belépés Google-lal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800">Quiz Platform</span>
          </button>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setView('dashboard')}
              className={`px-4 py-2 rounded-lg ${view === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView('upload')}
              className={`px-4 py-2 rounded-lg ${view === 'upload' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Feltöltés
            </button>
            <button
              onClick={() => setView('create')}
              className={`px-4 py-2 rounded-lg ${view === 'create' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Kérdés Készítő
            </button>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className={`w-10 h-10 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white font-bold text-sm`}>
                  {getInitials(user.name)}
                </div>
                <span className="text-sm text-gray-700 font-medium">{user.name}</span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Kilépés
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {view === 'dashboard' && (
          <Dashboard
            quizzes={quizzes}
            history={history}
            searchTerm={searchTerm}
            onSearch={handleSearch}
            onStartQuiz={(quiz) => {
              setCurrentQuiz(quiz);
              setView('quiz');
            }}
            onReviewAttempt={handleReviewAttempt}
          />
        )}

        {view === 'upload' && <UploadView onUploadSuccess={() => { loadQuizzes(); setView('dashboard'); }} />}

        {view === 'create' && <CreateQuizView onCreateSuccess={() => { loadQuizzes(); setView('dashboard'); }} />}

        {view === 'quiz' && currentQuiz && (
          <QuizView
            quiz={currentQuiz}
            onComplete={() => {
              setView('dashboard');
              setCurrentQuiz(null);
              loadHistory();
            }}
          />
        )}

        {view === 'review' && reviewAttempt && (
          <ReviewView
            attempt={reviewAttempt}
            onClose={() => {
              setView('dashboard');
              setReviewAttempt(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function Dashboard({ quizzes, history, searchTerm, onSearch, onStartQuiz, onReviewAttempt }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Keresés címre vagy témakörre..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Tesztjeim
          </h2>
          <div className="space-y-3">
            {quizzes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Még nincs feltöltött teszt</p>
            ) : (
              quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
                  onClick={() => onStartQuiz(quiz)}
                >
                  <h3 className="font-semibold text-gray-800">{quiz.title}</h3>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>{quiz.question_count} kérdés</span>
                    {quiz.topic && <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{quiz.topic}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Legutóbbi Eredmények
          </h2>
          <div className="space-y-3">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Még nincs kitöltött teszt</p>
            ) : (
              history.slice(0, 5).map((attempt) => (
                <div key={attempt.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{attempt.quiz_title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(attempt.completed_at).toLocaleDateString('hu-HU')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${attempt.percentage >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                        {Math.round(attempt.percentage)}%
                      </div>
                      <div className="text-sm text-gray-500">{attempt.score}/{attempt.total_questions}</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReviewAttempt(attempt);
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Visszanézés
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadView({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (res.ok) {
        alert('Teszt sikeresen feltöltve!');
        onUploadSuccess();
      } else {
        alert('Hiba történt a feltöltés során');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Hiba történt a feltöltés során');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Új Teszt Feltöltése</h2>
        
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
            dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
          }`}
        >
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Húzd ide a fájlt vagy kattints a tallózáshoz</p>
          <p className="text-sm text-gray-500 mb-4">JSON vagy XML formátum</p>
          <input
            type="file"
            accept=".json,.xml"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-indigo-700 transition"
          >
            Fájl kiválasztása
          </label>
        </div>

        {file && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Kiválasztott fájl:</p>
            <p className="font-medium text-gray-800">{file.name}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {uploading ? 'Feltöltés...' : 'Teszt Feltöltése'}
        </button>

        <div className="mt-8 space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Példa JSON formátum:</h3>
            <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
{`{
  "title": "React Alapok",
  "topic": "Frontend",
  "questions": [
    {
      "text": "Mi a useState?",
      "options": ["DB", "Hook", "Komponens", "Szerver"],
      "correctIndex": 1,
      "explanation": "A useState egy React Hook"
    }
  ]
}`}
            </pre>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Példa XML formátum:</h3>
            <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
{`<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <title>JavaScript Alapok</title>
  <topic>Programming</topic>
  <description>JS koncepciók tesztelése</description>
  <questions>
    <question>
      <text>Mi az === operátor?</text>
      <options>
        <option>Hozzárendelés</option>
        <option>Egyenlőség típus-konverzióval</option>
        <option>Szigorú egyenlőség</option>
        <option>Nem létezik</option>
      </options>
      <correctIndex>2</correctIndex>
      <explanation>Strict equality, típust is ellenőriz</explanation>
    </question>
  </questions>
</quiz>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizView({ quiz, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadQuiz();
  }, []);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadQuiz = async () => {
    try {
      const res = await fetch(`${API_URL}/api/quizzes/${quiz.id}`, { credentials: 'include' });
      const data = await res.json();
      
      // Shuffle questions
      const shuffledQuestions = shuffleArray(data.questions).map(q => {
        // Create mapping for shuffled options
        const optionsWithIndex = q.options.map((opt, idx) => ({ option: opt, originalIndex: idx }));
        const shuffledOptions = shuffleArray(optionsWithIndex);
        
        // Find new position of correct answer
        const newCorrectIndex = shuffledOptions.findIndex(
          item => item.originalIndex === q.correct_index
        );
        
        return {
          ...q,
          options: shuffledOptions.map(item => item.option),
          correct_index: newCorrectIndex,
          originalOptions: q.options,
          originalCorrectIndex: q.correct_index
        };
      });
      
      setQuestions(shuffledQuestions);
    } catch (err) {
      console.error('Failed to load quiz:', err);
    }
  };

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleSubmit = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    // Convert shuffled answers back to original indices
    const originalAnswers = {};
    questions.forEach(q => {
      if (answers[q.id] !== undefined) {
        // Find which original option was selected
        const selectedOption = q.options[answers[q.id]];
        const originalIndex = q.originalOptions.indexOf(selectedOption);
        originalAnswers[q.id] = originalIndex;
      }
    });
    
    try {
      const res = await fetch(`${API_URL}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quizId: quiz.id, answers: originalAnswers, timeSpent })
      });
      
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to submit:', err);
    }
  };

  if (questions.length === 0) {
    return <div className="text-center py-12">Töltés...</div>;
  }

  if (result) {
    const wrongAnswers = questions.filter(q => answers[q.id] !== q.correct_index);
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Teszt Befejezve!</h2>
            <div className="text-6xl font-bold text-indigo-600 my-6">
              {Math.round(result.percentage)}%
            </div>
            <p className="text-xl text-gray-600 mb-8">
              {result.score} helyes válasz {result.total_questions}-ból
            </p>
          </div>

          {wrongAnswers.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Elrontott kérdések ({wrongAnswers.length})
              </h3>
              <div className="space-y-4">
                {wrongAnswers.map((q, idx) => (
                  <div key={q.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-semibold text-gray-800 mb-3">{q.question_text}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-red-700 font-medium">Te: </span>
                          <span className="text-gray-700">{q.options[answers[q.id]]}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-green-700 font-medium">Helyes: </span>
                          <span className="text-gray-700">{q.options[q.correct_index]}</span>
                        </div>
                      </div>
                      {q.explanation && (
                        <div className="mt-2 pt-2 border-t border-red-200">
                          <p className="text-gray-600 italic">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onComplete}
            className="w-full mt-8 bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Vissza a Dashboard-ra
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              Kérdés {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Object.keys(answers).length} / {questions.length} megválaszolva
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-6">{currentQuestion.question_text}</h3>

        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(currentQuestion.id, idx)}
              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                answers[currentQuestion.id] === idx
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {option}
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Előző
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length}
              className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Beküldés
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Következő
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewView({ attempt, onClose }) {
  const answers = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : attempt.answers;
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{attempt.quiz_title}</h2>
            <p className="text-gray-600 mt-1">
              Kitöltve: {new Date(attempt.completed_at).toLocaleDateString('hu-HU', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="mb-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Eredmény</p>
              <p className="text-3xl font-bold text-indigo-600">{Math.round(attempt.percentage)}%</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Helyes válaszok</p>
              <p className="text-2xl font-semibold text-gray-800">{attempt.score} / {attempt.total_questions}</p>
            </div>
            {attempt.time_spent && (
              <div>
                <p className="text-gray-600 text-sm">Időtartam</p>
                <p className="text-2xl font-semibold text-gray-800">{Math.floor(attempt.time_spent / 60)}:{(attempt.time_spent % 60).toString().padStart(2, '0')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-gray-800">Minden kérdés áttekintése</h3>
          {attempt.questions.map((question, idx) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correct_index;
            
            return (
              <div 
                key={question.id} 
                className={`p-6 rounded-lg border-2 ${
                  isCorrect 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-lg">
                      {idx + 1}. {question.question_text}
                    </p>
                  </div>
                </div>

                <div className="ml-9 space-y-3">
                  {question.options.map((option, optIdx) => {
                    const isUserAnswer = userAnswer === optIdx;
                    const isCorrectAnswer = question.correct_index === optIdx;
                    
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
                          {isCorrectAnswer && (
                            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
                              Helyes válasz
                            </span>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full font-medium">
                              A te válaszod
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {question.explanation && (
                  <div className="ml-9 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Magyarázat:</p>
                    <p className="text-sm text-blue-800">{question.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-8 bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Bezárás
        </button>
      </div>
    </div>
  );
}

function CreateQuizView({ onCreateSuccess }) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([{
    text: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: ''
  }]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, {
      text: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: ''
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      alert('Kérlek adj meg egy címet!');
      return;
    }

    const validQuestions = questions.filter(q => 
      q.text.trim() && q.options.every(o => o.trim())
    );

    if (validQuestions.length === 0) {
      alert('Legalább egy teljes kérdést ki kell tölteni!');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/create-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          topic,
          description,
          questions: validQuestions
        })
      });

      if (res.ok) {
        alert('Teszt sikeresen létrehozva!');
        onCreateSuccess();
      } else {
        alert('Hiba történt a mentés során');
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('Hiba történt a mentés során');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <Edit3 className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800">Új Teszt Készítése</h2>
        </div>

        {/* Quiz details */}
        <div className="space-y-4 mb-8 p-6 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teszt címe *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="pl. JavaScript Alapok"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Témakör
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="pl. Programming"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leírás
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="pl. Alapvető JS koncepciók"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Kérdések ({questions.length})</h3>
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              Új Kérdés
            </button>
          </div>

          {questions.map((question, qIndex) => (
            <div key={qIndex} className="p-6 border-2 border-gray-200 rounded-lg space-y-4">
              <div className="flex items-start justify-between">
                <h4 className="text-lg font-semibold text-gray-800">Kérdés {qIndex + 1}</h4>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kérdés szövege *
                </label>
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                  placeholder="Írd ide a kérdést..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Válaszlehetőségek *
                </label>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctIndex === oIndex}
                        onChange={() => updateQuestion(qIndex, 'correctIndex', oIndex)}
                        className="w-5 h-5 text-indigo-600 cursor-pointer"
                      />
                      <span className="font-medium text-gray-700 w-6">
                        {String.fromCharCode(65 + oIndex)}.
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Válasz ${String.fromCharCode(65 + oIndex)}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      {question.correctIndex === oIndex && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Kattints a kör ikonra, hogy beállítsd a helyes választ
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Magyarázat (opcionális)
                </label>
                <textarea
                  value={question.explanation}
                  onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                  placeholder="Magyarázat a helyes válaszhoz..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {saving ? 'Mentés...' : 'Teszt Mentése'}
          </button>
          <button
            onClick={() => {
              if (confirm('Biztosan elveted a változásokat?')) {
                onCreateSuccess();
              }
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Mégse
          </button>
        </div>
      </div>
    </div>
  );
}