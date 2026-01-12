import React, { useState } from 'react';
import { Edit3, Plus, Trash2, Clock, X, Image as ImageIcon } from 'lucide-react';
import Card, { CardBody } from '../common/Card';
import Button from '../common/Button';
import SingleChoiceEditor from './creator/SingleChoiceEditor';
import MultipleChoiceEditor from './creator/MultipleChoiceEditor';
import TrueFalseEditor from './creator/TrueFalseEditor';
import NumericEditor from './creator/NumericEditor';
import MatchingEditor from './creator/MatchingEditor';
import { useQuizzes } from '../../hooks/useQuizzes';
import { API_URL } from '../../utils/constants';

const CreateQuizView = ({ onCreateSuccess }) => {
  const { createQuiz, loading } = useQuizzes();
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
        newQuestions[qIndex].data = { 
          pairs: [{ left: '', right: '' }, { left: '', right: '' }], 
          correctPairs: {} 
        };
        break;
      default:
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
    
    if (!file.type.startsWith('image/')) {
      alert('Csak képfájlokat tölthetsz fel!');
      return;
    }
    
    if (file.size > 1 * 1024 * 1024) {
      alert('A kép mérete maximum 1MB lehet!');
      return;
    }

    const reader = new FileReader();
    
    reader.onloadend = () => {
      try {
        const img = new Image();
        img.onload = () => {
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

    try {
      await fetch(`${API_URL}/api/create-quiz`, {
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

      alert('Teszt sikeresen létrehozva!');
      onCreateSuccess();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Hiba történt a mentés során');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardBody className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Edit3 className="w-6 h-6" />
              Új Teszt Készítése
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Hozz létre egyedi tesztet különböző kérdéstípusokkal
            </p>
          </div>

          {/* Quiz Info - Kompakt Grid */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid md:grid-cols-3 gap-4 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Teszt címe *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="JavaScript Alapok"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Témakör
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Programming"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Leírás
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Alapvető JS koncepciók"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Time Limit - Inline */}
            <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTimeLimited}
                  onChange={(e) => setIsTimeLimited(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Időzített teszt</span>
              </label>
              
              {isTimeLimited && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">perc</span>
                </div>
              )}
            </div>
          </div>

          {/* Questions Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">
              Kérdések <span className="text-indigo-600">({questions.length})</span>
            </h3>
            <button
              onClick={addQuestion}
              type="button"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Új Kérdés
            </button>
          </div>

          {/* Questions - Compact Layout */}
          <div className="space-y-4">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                {/* Question Header - Compact */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full text-sm font-bold">
                      {qIndex + 1}
                    </span>
                    <span className="px-2 py-1 bg-white border border-indigo-200 rounded-full text-xs font-medium text-indigo-700">
                      {question.points} pont
                    </span>
                  </div>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Kérdés törlése"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Question Content - 2 Column Grid */}
                <div className="p-4 grid md:grid-cols-2 gap-4">
                  {/* LEFT COLUMN */}
                  <div className="space-y-3">
                    {/* Question Text */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Kérdés szövege *
                      </label>
                      <textarea
                        value={question.text}
                        onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                        placeholder="Írd ide a kérdést..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    {/* Type and Points - Inline */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Típus *
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) => changeQuestionType(qIndex, e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="single_choice">Egy válaszos</option>
                          <option value="multiple_choice">Több válaszos</option>
                          <option value="true_false">Igaz/Hamis</option>
                          <option value="numeric">Számos</option>
                          <option value="matching">Illesztéses</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Pontérték *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={question.points}
                          onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Image Upload - Compact */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Kép (opcionális)
                      </label>
                      <div className="flex gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition text-sm">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {question.image ? 'Kép kiválasztva ✓' : 'Kép feltöltése'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(qIndex, e)}
                            className="hidden"
                          />
                        </label>
                        {question.image && (
                          <button
                            onClick={() => updateQuestion(qIndex, 'image', null)}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {question.image && (
                        <img 
                          src={question.image} 
                          alt="Preview" 
                          className="mt-2 w-full h-24 object-cover rounded border border-gray-200" 
                        />
                      )}
                    </div>

                    {/* Explanation - Compact */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Magyarázat (opcionális)
                      </label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                        placeholder="Miért ez a helyes válasz?"
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* RIGHT COLUMN - Question Type Specific */}
                  <div className="border-l border-gray-200 pl-4">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Válaszlehetőségek
                    </label>
                    
                    {question.type === 'single_choice' && (
                      <SingleChoiceEditor
                        question={question}
                        qIndex={qIndex}
                        updateQuestionData={updateQuestionData}
                        updateOption={updateOption}
                        addOption={addOption}
                        removeOption={removeOption}
                      />
                    )}

                    {question.type === 'multiple_choice' && (
                      <MultipleChoiceEditor
                        question={question}
                        qIndex={qIndex}
                        updateOption={updateOption}
                        addOption={addOption}
                        removeOption={removeOption}
                        toggleMultipleChoice={toggleMultipleChoice}
                      />
                    )}

                    {question.type === 'true_false' && (
                      <TrueFalseEditor
                        question={question}
                        qIndex={qIndex}
                        updateQuestionData={updateQuestionData}
                      />
                    )}

                    {question.type === 'numeric' && (
                      <NumericEditor
                        question={question}
                        qIndex={qIndex}
                        updateQuestionData={updateQuestionData}
                      />
                    )}

                    {question.type === 'matching' && (
                      <MatchingEditor
                        question={question}
                        qIndex={qIndex}
                        updateQuestionData={updateQuestionData}
                        addMatchingPair={addMatchingPair}
                        removeMatchingPair={removeMatchingPair}
                        updateMatchingPair={updateMatchingPair}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Buttons */}
          <div className="mt-6 pt-4 border-t-2 border-gray-200 flex gap-3">
            <Button
              onClick={handleSave}
              disabled={loading || !title || questions.length === 0}
              variant="primary"
              size="lg"
              className="flex-1"
            >
              {loading ? 'Mentés...' : 'Teszt Mentése'}
            </Button>
            <Button
              onClick={() => window.history.back()}
              variant="secondary"
              size="lg"
            >
              Mégse
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default CreateQuizView;
