import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Download, Clock, Sparkles, Plus } from 'lucide-react';
import Card, { CardBody } from '../common/Card';
import Button from '../common/Button';
import QuestionDrawer from './QuestionDrawer';
import QuestionListItem from './QuestionListItem';
import StickyQuestionNav from './StickyQuestionNav';
import AIQuizGenerator from '../ai/AIQuizGenerator';
import { useQuizzes } from '../../hooks/useQuizzes';
import { API_URL, apiFetch } from '../../utils/constants';
import { exportToMoodleXML, downloadMoodleXML } from '../../utils/moodleXMLExport';

const CreateQuizView = ({ onCreateSuccess, editQuiz = null }) => {
  const { loading } = useQuizzes();
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [isTimeLimited, setIsTimeLimited] = useState(false);
  const [timeLimit, setTimeLimit] = useState(30);
  const [questions, setQuestions] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  
  // AI Generator state
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  
  // Refs for scrolling
  const questionRefs = useRef([]);

  useEffect(() => {
    if (editQuiz) {
      console.log('🔍 Edit quiz data:', editQuiz);

      const quizData = editQuiz.quiz || editQuiz;
      const questionsData = editQuiz.questions || [];
      
      setTitle(quizData.title || '');
      setTopic(quizData.topic || '');
      setDescription(quizData.description || '');
      setCoverImage(quizData.cover_image || null);
      
      if (quizData.time_limit) {
        setIsTimeLimited(true);
        setTimeLimit(quizData.time_limit);
      }
      
      if (questionsData.length > 0) {
        const loadedQuestions = questionsData.map(q => ({
          type: q.question_type || q.type || 'single_choice',
          text: q.question_text || q.text || '',
          image: q.question_image || q.image || null,
          data: q.question_data || q.data || {},
          points: q.points || 1,
          explanation: q.explanation || ''
        }));
        
        setQuestions(loadedQuestions);
      }
      // Removed auto-creation of empty question for editing
    }
    // Removed auto-creation of empty question for new quiz
  }, [editQuiz]);

  const addQuestion = () => {
    const newQ = {
      type: 'single_choice',
      text: '',
      image: null,
      data: {
        options: ['', '', '', ''],
        correctIndex: 0
      },
      points: 1,
      explanation: ''
    };
    
    const newQuestions = [...questions, newQ];
    setQuestions(newQuestions);
    
    // Smooth scroll to new question + auto-open for better UX
    setTimeout(() => {
      const newIndex = newQuestions.length - 1;
      questionRefs.current[newIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      // Auto-open drawer for immediate editing
      setEditingIndex(newIndex);
      setIsDrawerOpen(true);
    }, 100);
  };

  const openEditor = (index) => {
    setEditingIndex(index);
    setIsDrawerOpen(true);
  };

  const closeEditor = () => {
    setIsDrawerOpen(false);
    setEditingIndex(null);
  };

  const updateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
    closeEditor();
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    } else {
      alert('Legalább egy kérdés szükséges!');
    }
  };

  const jumpToQuestion = (index) => {
    questionRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  };

  const handleAIGenerate = (aiData) => {
    console.log('🤖 AI Generated quiz data:', aiData);
    
    // Load AI-generated data
    setTitle(aiData.title || '');
    setTopic(aiData.topic || '');
    setDescription(aiData.description || '');
    
    if (aiData.timeLimit) {
      setIsTimeLimited(true);
      setTimeLimit(aiData.timeLimit);
    }
    
    if (aiData.questions && aiData.questions.length > 0) {
      setQuestions(aiData.questions);
    }
    
    setShowAIGenerator(false);
    
    alert(`✅ ${aiData.questions.length} kérdés sikeresen generálva! Szerkeszd és mentsd el a tesztet.`);
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

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Kérlek adj meg egy címet!');
      return;
    }

    const validQuestions = questions.filter(q => {
      if (!q.text.trim() && q.type !== 'cloze') return false;
      if (q.type === 'cloze' && !q.data?.text?.trim()) return false;
      
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
        case 'cloze':
          return q.data.text && q.data.blanks && q.data.blanks.length > 0;
        case 'essay':
          return true;
        default:
          return false;
      }
    });

    if (validQuestions.length === 0) {
      alert('Legalább egy teljes kérdést ki kell tölteni!');
      return;
    }

    const quizData = {
      title: title.trim(),
      topic: topic.trim(),
      description: description.trim(),
      cover_image: coverImage,
      time_limit: isTimeLimited ? timeLimit : null,
      questions: validQuestions
    };

    try {      
      const isUpdate = editQuiz && !editQuiz.isNew && (editQuiz.quiz?.id || editQuiz.id);
      
      if (isUpdate) {
        const quizId = editQuiz.quiz?.id || editQuiz.id;
        
        if (!quizId) {
          console.error('❌ Quiz ID not found!', editQuiz);
          alert('Hiba: Quiz ID hiányzik!');
          return;
        }
        
        console.log('💾 Updating quiz:', quizId);

        await apiFetch(`${API_URL}/api/quizzes/${quizId}`, {
          method: 'PUT',
          body: JSON.stringify(quizData)
        });

        alert('Teszt sikeresen frissítve! 🎉');
      } else {
        console.log('💾 Creating new quiz' + (editQuiz?.isNew ? ' (from XML import)' : ''));
        
        // ✅ apiFetch automatically handles everything
        await apiFetch(`${API_URL}/api/create-quiz`, {
          method: 'POST',
          body: JSON.stringify(quizData)
        });

        alert('Teszt sikeresen létrehozva! 🎉');
      }
      
      onCreateSuccess();
    } catch (err) {
      console.error('❌ Save failed:', err);
      alert(`Hiba történt a teszt ${isUpdate ? 'frissítése' : 'mentése'} során: ${err.message}`);
    }
  };

  const handleExportMoodleXML = () => {
    if (!title.trim()) {
      alert('Kérlek adj meg egy címet az exportáláshoz!');
      return;
    }

    const validQuestions = questions.filter(q => {
      if (!q.text.trim() && q.type !== 'cloze') return false;
      if (q.type === 'cloze' && !q.data?.text?.trim()) return false;
      
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
      alert('Legalább egy teljes kérdést ki kell tölteni az exportáláshoz!');
      return;
    }

    try {
      const quizData = {
        title,
        topic,
        description,
        questions: validQuestions
      };
      
      const xml = exportToMoodleXML(quizData);
      const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_moodle.xml`;
      downloadMoodleXML(xml, filename);
      
      alert('Moodle XML sikeresen exportálva!');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Hiba történt az exportálás során');
    }
  };

  const isUpdate = editQuiz && !editQuiz.isNew && (editQuiz.quiz?.id || editQuiz.id);

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pb-24">
      <Card>
        <CardBody className="p-3 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                  <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                  {isUpdate ? 'Teszt Szerkesztése' : 'Új Teszt Létrehozása'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors">
                  Hozz létre egyedi tesztet - kattints egy kérdésre a szerkesztéshez
                </p>
              </div>
              
              {/* AI Generate Button */}
              {!isUpdate && questions.length === 0 && (
                <Button
                  onClick={() => setShowAIGenerator(true)}
                  variant="secondary"
                  size="md"
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="hidden sm:inline">AI Teszt Generálás</span>
                  <span className="sm:hidden">AI</span>
                </Button>
              )}
            </div>
          </div>

          {/* Quiz Info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 lg:p-6 rounded-lg mb-4 sm:mb-6 transition-colors">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors">
                  Teszt címe *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="JavaScript Alapok"
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors">
                  Témakör
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Programming"
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors">
                  Leírás
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Alapvető JS koncepciók"
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
                />
              </div>
            </div>

            {/* Time Limit */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pt-3 border-t border-gray-200 dark:border-gray-700 transition-colors">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isTimeLimited}
                  onChange={(e) => setIsTimeLimited(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                  Időzített teszt
                </span>
              </label>
              
              {isTimeLimited && (
                <div className="flex items-center gap-2 ml-6 sm:ml-0">
                  <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-center focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors">perc</span>
                </div>
              )}
            </div>
          </div>

          {/* Questions List */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200 dark:border-gray-700 transition-colors">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white transition-colors">
                Kérdések <span className="text-indigo-600 dark:text-indigo-400">({questions.length})</span>
              </h3>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-lg shadow hover:shadow-md hover:scale-105 transition-all text-sm font-semibold flex-shrink-0"
                title="Új kérdés hozzáadása"
              >
                <Plus className="w-4 h-4" />
                <span>Új kérdés</span>
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 transition-colors">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Még nincsenek kérdések. Kattints az "Új kérdés" gombra a kezdéshez!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((question, idx) => (
                  <div
                    key={idx}
                    ref={(el) => (questionRefs.current[idx] = el)}
                  >
                    <QuestionListItem
                      question={question}
                      index={idx}
                      onEdit={() => openEditor(idx)}
                      onDelete={() => removeQuestion(idx)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="mt-4 sm:mt-6 pt-4 border-t-2 border-gray-200 dark:border-gray-700 transition-colors">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={handleSave}
                disabled={loading || !title || questions.length === 0}
                variant="primary"
                size="lg"
                className="flex-1 w-full"
              >
                {isUpdate ? 'Teszt Frissítése' : 'Teszt Mentése'}
              </Button>
              
              <Button
                onClick={handleExportMoodleXML}
                disabled={!title || questions.length === 0}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Moodle XML Export
              </Button>
              
              <Button
                onClick={onCreateSuccess}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Mégse
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 text-center transition-colors">
              💡 A Moodle XML export lehetővé teszi a teszt importálását Moodle-be
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Question Drawer */}
      {editingIndex !== null && (
        <QuestionDrawer
          isOpen={isDrawerOpen}
          onClose={closeEditor}
          question={questions[editingIndex]}
          questionIndex={editingIndex}
          onSave={(updatedQuestion) => updateQuestion(editingIndex, updatedQuestion)}
          onDelete={questions.length > 1 ? () => removeQuestion(editingIndex) : null}
          handleImageUpload={handleImageUpload}
        />
      )}

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <AIQuizGenerator
          onGenerate={handleAIGenerate}
          onClose={() => setShowAIGenerator(false)}
        />
      )}

      {/* Sticky Navigation */}
      <StickyQuestionNav
        questions={questions}
        onJumpToQuestion={jumpToQuestion}
      />
    </div>
  );
};

export default CreateQuizView;