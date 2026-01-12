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
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardBody className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Edit3 className="w-8 h-8 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-800">Új Teszt Készítése</h2>
          </div>

          {/* Quiz metadata */}
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

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Kérdések ({questions.length})</h3>
              <button
                onClick={addQuestion}
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
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

                {/* Image upload */}
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

                {/* Question type specific editors */}
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
                    updateMatchingPair={updateMatchingPair}
                    addMatchingPair={addMatchingPair}
                    removeMatchingPair={removeMatchingPair}
                  />
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

          {/* Save buttons */}
          <div className="mt-8 flex gap-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              variant="success"
              size="lg"
              className="flex-1"
            >
              {loading ? 'Mentés...' : 'Teszt Mentése'}
            </Button>
            <Button
              onClick={() => {
                if (window.confirm('Biztosan elveted a változásokat?')) {
                  onCreateSuccess();
                }
              }}
              variant="outline"
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
