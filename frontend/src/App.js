import React, { useState, useEffect } from 'react';
import { Search, Upload, BookOpen, TrendingUp, Clock, CheckCircle, X, LogOut, Eye, XCircle, Plus, Trash2, Edit3, Minus, Image as ImageIcon } from 'lucide-react';

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

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Biztosan törlöd ezt a tesztet? Ez véglegesen törli az összes hozzá tartozó eredményt is!')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        alert('Teszt sikeresen törölve!');
        loadQuizzes();
        loadHistory();
      } else {
        alert('Hiba történt a törlés során');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Hiba történt a törlés során');
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
            onDeleteQuiz={handleDeleteQuiz}
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

function Dashboard({ quizzes, history, searchTerm, onSearch, onStartQuiz, onReviewAttempt, onDeleteQuiz }) {
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
                  className="relative border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition cursor-pointer group"
                  onClick={() => onStartQuiz(quiz)}
                >
                  <h3 className="font-semibold text-gray-800 pr-8">{quiz.title}</h3>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>{quiz.question_count} kérdés</span>
                    {quiz.topic && <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{quiz.topic}</span>}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteQuiz(quiz.id);
                    }}
                    className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                    title="Teszt törlése"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
                      <div className="text-sm text-gray-500">{attempt.score}/{attempt.total_points} pont</div>
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
  "title": "Programozás Alapok",
  "topic": "Informatika",
  "description": "Python és JavaScript alapok",
  "timeLimit": 10,
  "questions": [
    {
      "type": "single_choice",
      "text": "Mi a Python fő jellemzője?",
      "image": "data:image/png;base64,...",
      "data": {
        "options": ["Gyors", "Olvasható", "Bonyolult", "Régi"],
        "correctIndex": 1
      },
      "points": 2,
      "explanation": "A Python az olvashatóságra épül"
    },
    {
      "type": "multiple_choice",
      "text": "Melyek dinamikus nyelvek?",
      "data": {
        "options": ["Python", "Java", "JavaScript", "C++"],
        "correctIndices": [0, 2]
      },
      "points": 3
    },
    {
      "type": "true_false",
      "text": "A JavaScript csak böngészőben fut",
      "data": {
        "correctAnswer": false
      },
      "points": 2
    },
    {
      "type": "numeric",
      "text": "Hány biten tárol egy byte?",
      "data": {
        "correctAnswer": 8,
        "unit": "bit"
      },
      "points": 2
    },
    {
      "type": "matching",
      "text": "Párosítsd a nyelvet a típusával",
      "data": {
        "pairs": [
          {"left": "Python", "right": "Értelmezett"},
          {"left": "C", "right": "Fordított"}
        ],
        "correctPairs": {"0": 0, "1": 1}
      },
      "points": 4
    }
  ]
}`}
            </pre>
            <div className="mt-3 p-3 bg-blue-100 rounded text-sm">
              <p className="font-semibold text-blue-900 mb-2">📌 Kérdéstípusok:</p>
              <ul className="space-y-1 text-blue-800 text-xs">
                <li><strong>single_choice:</strong> Egy helyes válasz (correctIndex)</li>
                <li><strong>multiple_choice:</strong> Több helyes válasz (correctIndices tömb)</li>
                <li><strong>true_false:</strong> Igaz/Hamis (correctAnswer: true/false)</li>
                <li><strong>numeric:</strong> Szám válasz (correctAnswer + opcionális unit)</li>
                <li><strong>matching:</strong> Párosítás (pairs tömb + correctPairs objektum)</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Példa XML formátum:</h3>
            <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
{`<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <title>Történelem Kvíz</title>
  <topic>Történelem</topic>
  <description>Magyar történelem alapok</description>
  <timeLimit>15</timeLimit>
  <questions>
    <question>
      <type>single_choice</type>
      <text>Mikor volt a mohácsi csata?</text>
      <data>
        <options>
          <option>1456</option>
          <option>1526</option>
          <option>1848</option>
          <option>1956</option>
        </options>
        <correctIndex>1</correctIndex>
      </data>
      <points>2</points>
      <explanation>1526-ban volt a mohácsi csata</explanation>
    </question>
    <question>
      <type>true_false</type>
      <text>Mátyás király apja Hunyadi János volt</text>
      <data>
        <correctAnswer>true</correctAnswer>
      </data>
      <points>2</points>
    </question>
  </questions>
</quiz>`}
            </pre>
            <div className="mt-3 p-3 bg-green-100 rounded text-sm">
              <p className="font-semibold text-green-900 mb-2">💡 Tippek:</p>
              <ul className="space-y-1 text-green-800 text-xs">
                <li><strong>timeLimit:</strong> percekben (opcionális, null = nincs korlát)</li>
                <li><strong>image:</strong> base64 kép vagy URL (opcionális)</li>
                <li><strong>points:</strong> kérdés pontértéke (alapértelmezett: 1)</li>
                <li><strong>explanation:</strong> magyarázat a helyes válaszhoz (opcionális)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateQuizView({ onCreateSuccess }) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [isTimeLimited, setIsTimeLimited] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState([{
    type: 'single_choice',
    text: '',
    image: null,
    data: {
      options: ['', '', '', ''],
      correctIndex: 0
    },
    points: 1,
    explanation: ''
  }]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, {
      type: 'single_choice',
      text: '',
      image: null,
      data: {
        options: ['', '', '', ''],
        correctIndex: 0
      },
      points: 1,
      explanation: ''
    }]);
  };

  const changeQuestionType = (qIndex, newType) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].type = newType;
    
    // Set default data based on type
    switch(newType) {
      case 'single_choice':
        newQuestions[qIndex].data = { options: ['', '', '', ''], correctIndex: 0 };
        break;
      case 'multiple_choice':
        newQuestions[qIndex].data = { options: ['', '', '', ''], correctIndices: [] };
        break;
      case 'true_false':
        newQuestions[qIndex].data = { correctAnswer: true };
        break;
      case 'numeric':
        newQuestions[qIndex].data = { correctAnswer: 0, unit: '' };
        break;
      case 'matching':
        newQuestions[qIndex].data = { pairs: [{ left: '', right: '' }, { left: '', right: '' }], correctPairs: {} };
        break;
    }
    
    setQuestions(newQuestions);
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

  const updateQuestionData = (qIndex, field, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].data[field] = value;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].data.options[oIndex] = value;
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].data.options.length < 6) {
      newQuestions[qIndex].data.options.push('');
      setQuestions(newQuestions);
    }
  };

  const removeOption = (qIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].data.options.length > 2) {
      newQuestions[qIndex].data.options.pop();
      const q = newQuestions[qIndex];
      if (q.type === 'single_choice' && q.data.correctIndex >= q.data.options.length) {
        q.data.correctIndex = q.data.options.length - 1;
      }
      if (q.type === 'multiple_choice') {
        q.data.correctIndices = q.data.correctIndices.filter(i => i < q.data.options.length);
      }
      setQuestions(newQuestions);
    }
  };

  const toggleMultipleChoice = (qIndex, optionIndex) => {
    const newQuestions = [...questions];
    const indices = newQuestions[qIndex].data.correctIndices || [];
    const idx = indices.indexOf(optionIndex);
    
    if (idx > -1) {
      indices.splice(idx, 1);
    } else {
      indices.push(optionIndex);
    }
    
    newQuestions[qIndex].data.correctIndices = indices;
    setQuestions(newQuestions);
  };

  const addMatchingPair = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].data.pairs.push({ left: '', right: '' });
    setQuestions(newQuestions);
  };

  const removeMatchingPair = (qIndex, pairIndex) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].data.pairs.length > 2) {
      newQuestions[qIndex].data.pairs.splice(pairIndex, 1);
      setQuestions(newQuestions);
    }
  };

  const updateMatchingPair = (qIndex, pairIndex, side, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].data.pairs[pairIndex][side] = value;
    
    // Auto-generate correct pairs (left index -> right index mapping)
    const correctPairs = {};
    newQuestions[qIndex].data.pairs.forEach((pair, idx) => {
      correctPairs[idx] = idx;
    });
    newQuestions[qIndex].data.correctPairs = correctPairs;
    
    setQuestions(newQuestions);
  };

  const handleImageUpload = (qIndex, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Csak képfájlokat tölthetsz fel!');
      return;
    }
    
    // Check file size (max 1MB for better compression)
    if (file.size > 1 * 1024 * 1024) {
      alert('A kép mérete maximum 1MB lehet!');
      return;
    }

    const reader = new FileReader();
    
    reader.onloadend = () => {
      try {
        const img = new Image();
        img.onload = () => {
          // Resize image if too large
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxWidth = 800;
          const maxHeight = 600;
          
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
          
          const newQuestions = [...questions];
          newQuestions[qIndex].image = compressedImage;
          setQuestions(newQuestions);
        };
        
        img.onerror = () => {
          alert('Hiba történt a kép feldolgozása során');
        };
        
        img.src = reader.result;
      } catch (err) {
        console.error('Image upload error:', err);
        alert('Hiba történt a kép feltöltése során');
      }
    };
    
    reader.onerror = () => {
      alert('Hiba történt a kép olvasása során');
    };
    
    reader.readAsDataURL(file);
  };

  const removeImage = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].image = null;
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Kérlek adj meg egy címet!');
      return;
    }

    const validQuestions = questions.filter(q => {
      if (!q.text.trim()) return false;
      
      // Validate based on type
      switch(q.type) {
        case 'single_choice':
        case 'multiple_choice':
          return q.data.options && q.data.options.every(o => o.trim());
        case 'true_false':
          return q.data.correctAnswer !== undefined;
        case 'numeric':
          return q.data.correctAnswer !== undefined && q.data.correctAnswer !== null;
        case 'matching':
          return q.data.pairs && q.data.pairs.length >= 2 && 
                 q.data.pairs.every(p => p.left.trim() && p.right.trim());
        default:
          return false;
      }
    });

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
          timeLimit: isTimeLimited ? timeLimit : null,
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

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTimeLimited}
                    onChange={(e) => setIsTimeLimited(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Időzített teszt</span>
                    <p className="text-xs text-gray-500">Időkorlát beállítása a teszt kitöltésére</p>
                  </div>
                </label>
              </div>
              
              {isTimeLimited && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center"
                    />
                    <span className="text-sm text-gray-700 font-medium">perc</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

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
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold text-gray-800">Kérdés {qIndex + 1}</h4>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {question.points} pont
                  </span>
                </div>
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
                  Pontérték *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={question.points}
                  onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Nehezebb kérdéseknek adj több pontot (1-100)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kérdés típusa *
                </label>
                <select
                  value={question.type}
                  onChange={(e) => changeQuestionType(qIndex, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="single_choice">Egy válaszos</option>
                  <option value="multiple_choice">Több válaszos</option>
                  <option value="true_false">Igaz/Hamis</option>
                  <option value="numeric">Számos válasz</option>
                  <option value="matching">Illesztéses</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kép hozzáadása (opcionális)
                </label>
                {question.image ? (
                  <div className="relative">
                    <img 
                      src={question.image} 
                      alt="Question" 
                      className="w-full max-h-64 object-contain rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(qIndex)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(qIndex, e)}
                      className="hidden"
                      id={`image-upload-${qIndex}`}
                    />
                    <label
                      htmlFor={`image-upload-${qIndex}`}
                      className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Kép feltöltése
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (max 1MB)</p>
                  </div>
                )}
              </div>

              {/* Render based on question type */}
              {question.type === 'single_choice' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Válaszlehetőségek * ({question.data.options?.length || 0})
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeOption(qIndex)}
                        disabled={(question.data.options?.length || 0) <= 2}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                        type="button"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => addOption(qIndex)}
                        disabled={(question.data.options?.length || 0) >= 6}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                        type="button"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(question.data.options || []).map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.data.correctIndex === oIndex}
                          onChange={() => updateQuestionData(qIndex, 'correctIndex', oIndex)}
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
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        {question.data.correctIndex === oIndex && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Kattints a kör ikonra a helyes válaszhoz • Min 2, max 6 válasz
                  </p>
                </div>
              )}

              {question.type === 'multiple_choice' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Válaszlehetőségek * ({question.data.correctIndices?.length || 0} helyes)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeOption(qIndex)}
                        disabled={(question.data.options?.length || 0) <= 2}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                        type="button"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => addOption(qIndex)}
                        disabled={(question.data.options?.length || 0) >= 6}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                        type="button"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {(question.data.options || []).map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={question.data.correctIndices?.includes(oIndex)}
                          onChange={() => toggleMultipleChoice(qIndex, oIndex)}
                          className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                        />
                        <span className="font-medium text-gray-700 w-6">
                          {String.fromCharCode(65 + oIndex)}.
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Válasz ${String.fromCharCode(65 + oIndex)}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        {question.data.correctIndices?.includes(oIndex) && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Pipáld be az összes helyes választ
                  </p>
                </div>
              )}

              {question.type === 'true_false' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Helyes válasz *
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => updateQuestionData(qIndex, 'correctAnswer', true)}
                      className={`flex-1 px-6 py-4 rounded-lg border-2 transition ${
                        question.data.correctAnswer === true
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-semibold text-lg">IGAZ</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateQuestionData(qIndex, 'correctAnswer', false)}
                      className={`flex-1 px-6 py-4 rounded-lg border-2 transition ${
                        question.data.correctAnswer === false
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <XCircle className="w-6 h-6" />
                        <span className="font-semibold text-lg">HAMIS</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {question.type === 'numeric' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Helyes válasz (szám) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={question.data.correctAnswer || 0}
                      onChange={(e) => updateQuestionData(qIndex, 'correctAnswer', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="pl. 42"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mértékegység (opcionális)
                    </label>
                    <input
                      type="text"
                      value={question.data.unit || ''}
                      onChange={(e) => updateQuestionData(qIndex, 'unit', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="pl. km, kg, °C"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    💡 A felhasználónak számot kell beírnia válaszként
                  </p>
                </div>
              )}

              {question.type === 'matching' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Párosítandó elemek ({question.data.pairs?.length || 0} pár)
                    </label>
                    <button
                      type="button"
                      onClick={() => addMatchingPair(qIndex)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                    >
                      <Plus className="w-4 h-4" />
                      Pár hozzáadása
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(question.data.pairs || []).map((pair, pairIndex) => (
                      <div key={pairIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-600">{pairIndex + 1}.</span>
                        <input
                          type="text"
                          value={pair.left}
                          onChange={(e) => updateMatchingPair(qIndex, pairIndex, 'left', e.target.value)}
                          placeholder="Bal oldal"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-gray-400">↔</span>
                        <input
                          type="text"
                          value={pair.right}
                          onChange={(e) => updateMatchingPair(qIndex, pairIndex, 'right', e.target.value)}
                          placeholder="Jobb oldal"
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        {(question.data.pairs?.length || 0) > 2 && (
                          <button
                            type="button"
                            onClick={() => removeMatchingPair(qIndex, pairIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 A felhasználónak össze kell kötnie a bal és jobb oldali elemeket
                  </p>
                </div>
              )}

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
              if (window.confirm('Biztosan elveted a változásokat?')) {
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

function QuizView({ quiz, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [quizData, setQuizData] = useState(null);

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
      setQuizData(data.quiz);
      
      const shuffledQuestions = shuffleArray(data.questions).map(q => {
        // Only shuffle for choice-based questions
        if (q.question_type === 'single_choice' || q.question_type === 'multiple_choice') {
          const optionsWithIndex = q.question_data.options.map((opt, idx) => ({ option: opt, originalIndex: idx }));
          const shuffledOptions = shuffleArray(optionsWithIndex);
          
          if (q.question_type === 'single_choice') {
            const newCorrectIndex = shuffledOptions.findIndex(
              item => item.originalIndex === q.question_data.correctIndex
            );
            
            return {
              ...q,
              question_data: {
                ...q.question_data,
                options: shuffledOptions.map(item => item.option),
                correctIndex: newCorrectIndex,
                originalCorrectIndex: q.question_data.correctIndex
              },
              originalOptions: q.question_data.options
            };
          } else {
            // Multiple choice - map old indices to new
            const indexMap = {};
            shuffledOptions.forEach((item, newIdx) => {
              indexMap[item.originalIndex] = newIdx;
            });
            
            const newCorrectIndices = q.question_data.correctIndices.map(oldIdx => indexMap[oldIdx]);
            
            return {
              ...q,
              question_data: {
                ...q.question_data,
                options: shuffledOptions.map(item => item.option),
                correctIndices: newCorrectIndices,
                originalCorrectIndices: q.question_data.correctIndices
              },
              originalOptions: q.question_data.options
            };
          }
        }
        
        // For other types, shuffle matching pairs if applicable
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
    } catch (err) {
      console.error('Failed to load quiz:', err);
    }
  };

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleMultipleAnswer = (questionId, optionIndex) => {
    const currentAnswers = answers[questionId] || [];
    const newAnswers = currentAnswers.includes(optionIndex)
      ? currentAnswers.filter(i => i !== optionIndex)
      : [...currentAnswers, optionIndex];
    setAnswers({ ...answers, [questionId]: newAnswers });
  };

  const handleNumericAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleMatchingAnswer = (questionId, leftIndex, rightIndex) => {
    const currentPairs = answers[questionId] || {};
    setAnswers({ ...answers, [questionId]: { ...currentPairs, [leftIndex]: rightIndex } });
  };

  const handleSubmit = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    const processedAnswers = {};
    questions.forEach(q => {
      if (answers[q.id] !== undefined) {
        if (q.question_type === 'single_choice') {
          const selectedOption = q.question_data.options[answers[q.id]];
          const originalIndex = q.originalOptions.indexOf(selectedOption);
          processedAnswers[q.id] = originalIndex;
        } else if (q.question_type === 'multiple_choice') {
          const selectedIndices = answers[q.id] || [];
          const originalIndices = selectedIndices.map(idx => {
            const selectedOption = q.question_data.options[idx];
            return q.originalOptions.indexOf(selectedOption);
          });
          processedAnswers[q.id] = originalIndices;
        } else {
          processedAnswers[q.id] = answers[q.id];
        }
      }
    });
    
    try {
      const res = await fetch(`${API_URL}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quizId: quiz.id, answers: processedAnswers, timeSpent })
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
    const wrongAnswers = questions.filter(q => {
      const userAnswer = answers[q.id];
      const data = q.question_data;
      
      switch(q.question_type) {
        case 'single_choice':
          return userAnswer !== data.correctIndex;
        case 'multiple_choice':
          return JSON.stringify((userAnswer || []).sort()) !== JSON.stringify((data.correctIndices || []).sort());
        case 'true_false':
          return userAnswer !== data.correctAnswer;
        case 'numeric':
          return Math.abs(parseFloat(userAnswer) - parseFloat(data.correctAnswer)) >= 0.01;
        case 'matching':
          return JSON.stringify(userAnswer) !== JSON.stringify(data.correctPairs);
        default:
          return true;
      }
    });
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Teszt Befejezve!</h2>
            <div className="text-6xl font-bold text-indigo-600 my-6">
              {Math.round(result.percentage)}%
            </div>
            <p className="text-xl text-gray-600 mb-2">
              {result.score} / {result.total_points} pont
            </p>
            <p className="text-gray-500">
              {questions.filter(q => answers[q.id] === q.correct_index).length} helyes válasz {result.total_questions}-ból
            </p>
          </div>

          {wrongAnswers.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Elrontott kérdések ({wrongAnswers.length})
              </h3>
              <div className="space-y-4">
                {wrongAnswers.map((q, idx) => {
                  const userAnswer = answers[q.id];
                  const data = q.question_data;
                  
                  let userAnswerText = '';
                  let correctAnswerText = '';
                  
                  // Format answers based on question type
                  if (q.question_type === 'single_choice') {
                    userAnswerText = data.options[userAnswer] || 'Nincs válasz';
                    correctAnswerText = data.options[data.correctIndex];
                  } else if (q.question_type === 'multiple_choice') {
                    const userIndices = userAnswer || [];
                    userAnswerText = userIndices.length > 0 
                      ? userIndices.map(i => data.options[i]).join(', ') 
                      : 'Nincs válasz';
                    correctAnswerText = data.correctIndices.map(i => data.options[i]).join(', ');
                  } else if (q.question_type === 'true_false') {
                    userAnswerText = userAnswer === true ? 'IGAZ' : userAnswer === false ? 'HAMIS' : 'Nincs válasz';
                    correctAnswerText = data.correctAnswer ? 'IGAZ' : 'HAMIS';
                  } else if (q.question_type === 'numeric') {
                    userAnswerText = userAnswer ? `${userAnswer}${data.unit ? ' ' + data.unit : ''}` : 'Nincs válasz';
                    correctAnswerText = `${data.correctAnswer}${data.unit ? ' ' + data.unit : ''}`;
                  } else if (q.question_type === 'matching') {
                    userAnswerText = 'Helytelen párosítás';
                    correctAnswerText = 'Helyes párosítás a teszt végén látható';
                  }
                  
                  return (
                    <div key={q.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <p className="font-semibold text-gray-800">{q.question_text}</p>
                        <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-medium whitespace-nowrap ml-2">
                          -{q.points || 1} pont
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-red-700 font-medium">Te: </span>
                            <span className="text-gray-700">{userAnswerText}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-green-700 font-medium">Helyes: </span>
                            <span className="text-gray-700">{correctAnswerText}</span>
                          </div>
                        </div>
                        {q.explanation && (
                          <div className="mt-2 pt-2 border-t border-red-200">
                            <p className="text-gray-600 italic">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-600">
              Kérdés {currentIndex + 1} / {questions.length}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {Object.keys(answers).length} / {questions.length} megválaszolva
              </span>
              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-lg font-medium ${
                  timeRemaining < 60 ? 'bg-red-100 text-red-700' : 
                  timeRemaining < 300 ? 'bg-orange-100 text-orange-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-6">{currentQuestion.question_text}</h3>

        {currentQuestion.question_image && (
          <div className="mb-6">
            <img 
              src={currentQuestion.question_image} 
              alt="Question illustration" 
              className="w-full max-h-96 object-contain rounded-lg border border-gray-200"
            />
          </div>
        )}

        <div className="space-y-3 mb-8">
          {currentQuestion.question_type === 'single_choice' && (
            <>
              {currentQuestion.question_data.options.map((option, idx) => (
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
            </>
          )}

          {currentQuestion.question_type === 'multiple_choice' && (
            <>
              {currentQuestion.question_data.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleMultipleAnswer(currentQuestion.id, idx)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition flex items-center gap-3 ${
                    (answers[currentQuestion.id] || []).includes(idx)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(answers[currentQuestion.id] || []).includes(idx)}
                    readOnly
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                  <span><span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {option}</span>
                </button>
              ))}
              <p className="text-sm text-gray-600 mt-2">💡 Több helyes válasz is lehet</p>
            </>
          )}

          {currentQuestion.question_type === 'true_false' && (
            <div className="flex gap-4">
              <button
                onClick={() => handleAnswer(currentQuestion.id, true)}
                className={`flex-1 px-6 py-6 rounded-lg border-2 transition ${
                  answers[currentQuestion.id] === true
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <span className="font-bold text-2xl">IGAZ</span>
                </div>
              </button>
              <button
                onClick={() => handleAnswer(currentQuestion.id, false)}
                className={`flex-1 px-6 py-6 rounded-lg border-2 transition ${
                  answers[currentQuestion.id] === false
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <span className="font-bold text-2xl">HAMIS</span>
                </div>
              </button>
            </div>
          )}

          {currentQuestion.question_type === 'numeric' && (
            <div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="any"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleNumericAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Írd be a választ..."
                  className="flex-1 px-6 py-4 text-2xl border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {currentQuestion.question_data.unit && (
                  <span className="text-2xl font-medium text-gray-600">
                    {currentQuestion.question_data.unit}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">💡 Adj meg egy számot válaszként</p>
            </div>
          )}

          {currentQuestion.question_type === 'matching' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">💡 Kösd össze a megfelelő párokat</p>
              {currentQuestion.question_data.pairs.map((pair, leftIdx) => (
                <div key={leftIdx} className="flex items-center gap-4">
                  <div className="flex-1 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg font-medium">
                    {pair.left}
                  </div>
                  <span className="text-gray-400">→</span>
                  <select
                    value={answers[currentQuestion.id]?.[leftIdx] ?? ''}
                    onChange={(e) => handleMatchingAnswer(currentQuestion.id, leftIdx, parseInt(e.target.value))}
                    className="flex-1 p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Válassz...</option>
                    {currentQuestion.question_data.shuffledRightItems.map((rightItem, rightIdx) => (
                      <option key={rightIdx} value={rightIdx}>
                        {rightItem}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
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
              <p className="text-2xl font-semibold text-gray-800">{attempt.score} / {attempt.total_points} pont</p>
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
            const data = question.question_data;
            let isCorrect = false;
            
            // Check if answer is correct based on type
            switch(question.question_type) {
              case 'single_choice':
                isCorrect = userAnswer === data.correctIndex;
                break;
              case 'multiple_choice':
                isCorrect = JSON.stringify((userAnswer || []).sort()) === JSON.stringify((data.correctIndices || []).sort());
                break;
              case 'true_false':
                isCorrect = userAnswer === data.correctAnswer;
                break;
              case 'numeric':
                isCorrect = Math.abs(parseFloat(userAnswer) - parseFloat(data.correctAnswer)) < 0.01;
                break;
              case 'matching':
                isCorrect = JSON.stringify(userAnswer) === JSON.stringify(data.correctPairs);
                break;
            }
            
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
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-gray-800 text-lg">
                        {idx + 1}. {question.question_text}
                      </p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ml-2 whitespace-nowrap ${
                        isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {question.points || 1} pont
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 inline-block">
                      Típus: {
                        question.question_type === 'single_choice' ? 'Egy válaszos' :
                        question.question_type === 'multiple_choice' ? 'Több válaszos' :
                        question.question_type === 'true_false' ? 'Igaz/Hamis' :
                        question.question_type === 'numeric' ? 'Számos' :
                        question.question_type === 'matching' ? 'Illesztéses' : 
                        question.question_type
                      }
                    </span>
                  </div>
                </div>

                {question.question_image && (
                  <div className="mb-4">
                    <img 
                      src={question.question_image} 
                      alt="Question" 
                      className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                {/* Single Choice */}
                {question.question_type === 'single_choice' && (
                  <div className="ml-9 space-y-3">
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
                )}

                {/* Multiple Choice */}
                {question.question_type === 'multiple_choice' && (
                  <div className="ml-9 space-y-3">
                    {data.options.map((option, optIdx) => {
                      // Get original indices from stored answers
                      const userOriginalIndices = userAnswer || [];
                      const correctOriginalIndices = data.correctIndices || [];
                      
                      const isUserAnswer = userOriginalIndices.includes(optIdx);
                      const isCorrectAnswer = correctOriginalIndices.includes(optIdx);
                      
                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-lg ${
                            isCorrectAnswer && isUserAnswer
                              ? 'bg-green-100 border-2 border-green-300' 
                              : isCorrectAnswer && !isUserAnswer
                              ? 'bg-yellow-100 border-2 border-yellow-300'
                              : isUserAnswer && !isCorrectAnswer
                              ? 'bg-red-100 border-2 border-red-300'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={isUserAnswer} 
                              readOnly 
                              className="w-4 h-4"
                            />
                            <span className="font-medium text-gray-700">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span className={`flex-1 ${
                              isCorrectAnswer && isUserAnswer ? 'font-semibold text-green-800' : 
                              isCorrectAnswer && !isUserAnswer ? 'font-semibold text-yellow-800' :
                              isUserAnswer ? 'font-semibold text-red-800' : 'text-gray-700'
                            }`}>
                              {option}
                            </span>
                            {isCorrectAnswer && isUserAnswer && (
                              <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-medium">
                                ✓ Helyesen választott
                              </span>
                            )}
                            {isCorrectAnswer && !isUserAnswer && (
                              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-medium">
                                ✓ Helyes (nem választottad)
                              </span>
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full font-medium">
                                ✗ Tévesen választott
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
                  <div className="ml-9 flex gap-4">
                    <div className={`flex-1 p-4 rounded-lg border-2 ${
                      data.correctAnswer === true 
                        ? 'bg-green-100 border-green-300' 
                        : userAnswer === true 
                        ? 'bg-red-100 border-red-300'
                        : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-bold">IGAZ</span>
                        {data.correctAnswer === true && (
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full ml-auto">
                            Helyes
                          </span>
                        )}
                        {userAnswer === true && data.correctAnswer !== true && (
                          <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full ml-auto">
                            Te
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`flex-1 p-4 rounded-lg border-2 ${
                      data.correctAnswer === false 
                        ? 'bg-green-100 border-green-300' 
                        : userAnswer === false 
                        ? 'bg-red-100 border-red-300'
                        : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="font-bold">HAMIS</span>
                        {data.correctAnswer === false && (
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full ml-auto">
                            Helyes
                          </span>
                        )}
                        {userAnswer === false && data.correctAnswer !== false && (
                          <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full ml-auto">
                            Te
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Numeric */}
                {question.question_type === 'numeric' && (
                  <div className="ml-9">
                    <div className={`p-4 rounded-lg border-2 ${
                      isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                    }`}>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">A te válaszod: </span>
                          <span className={`font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                            {userAnswer || 'Nincs válasz'}{data.unit ? ' ' + data.unit : ''}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Helyes válasz: </span>
                            <span className="font-bold text-green-800">
                              {data.correctAnswer}{data.unit ? ' ' + data.unit : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Matching */}
                {question.question_type === 'matching' && (
                  <div className="ml-9">
                    <div className={`p-4 rounded-lg border-2 ${
                      isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                    }`}>
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        {isCorrect ? 'Helyes párosítás!' : 'Helytelen párosítás'}
                      </p>
                      <div className="space-y-2">
                        {data.pairs.map((pair, pIdx) => {
                          const userPairIndex = userAnswer?.[pIdx];
                          const correctPairIndex = data.correctPairs[pIdx];
                          const isPairCorrect = userPairIndex === correctPairIndex;
                          
                          return (
                            <div key={pIdx} className="flex items-center gap-3 text-sm">
                              <span className="font-medium">{pair.left}</span>
                              <span className="text-gray-400">→</span>
                              <span className={isPairCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                                {data.pairs[userPairIndex]?.right || 'Nincs válasz'}
                              </span>
                              {!isPairCorrect && (
                                <>
                                  <span className="text-gray-400">(Helyes:</span>
                                  <span className="text-green-700 font-medium">{pair.right})</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

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