import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import SingleChoiceEditor from './creator/SingleChoiceEditor';
import MultipleChoiceEditor from './creator/MultipleChoiceEditor';
import TrueFalseEditor from './creator/TrueFalseEditor';
import NumericEditor from './creator/NumericEditor';
import MatchingEditor from './creator/MatchingEditor';
import ClozeEditor from './creator/ClozeEditor';
import EssayEditor from './creator/EssayEditor';

const QuestionDrawer = ({ 
  isOpen, 
  onClose, 
  question, 
  questionIndex,
  onSave,
  onDelete,
  // Editor helper functions
  updateQuestionData,
  updateOption,
  addOption,
  removeOption,
  toggleMultipleChoice,
  addMatchingPair,
  removeMatchingPair,
  updateMatchingPair,
  handleImageUpload
}) => {
  const [localQuestion, setLocalQuestion] = useState(question);

  useEffect(() => {
    setLocalQuestion(question);
  }, [question]);

  const handleLocalUpdate = (field, value) => {
    setLocalQuestion({ ...localQuestion, [field]: value });
  };

  const handleLocalDataUpdate = (field, value) => {
    setLocalQuestion({ 
      ...localQuestion, 
      data: { ...localQuestion.data, [field]: value } 
    });
  };

  const handleSave = () => {
    onSave(localQuestion);
  };

  const changeQuestionType = (newType) => {
    const updatedQuestion = { ...localQuestion, type: newType };
    
    switch(newType) {
      case 'single_choice':
        updatedQuestion.data = { options: ['', '', '', ''], correctIndex: 0 };
        break;
      case 'multiple_choice':
        updatedQuestion.data = { options: ['', '', '', ''], correctIndices: [] };
        break;
      case 'true_false':
        updatedQuestion.data = { correctAnswer: true };
        break;
      case 'numeric':
        updatedQuestion.data = { correctAnswer: 0, unit: '' };
        break;
      case 'matching':
        updatedQuestion.data = { 
          pairs: [{ left: '', right: '' }, { left: '', right: '' }], 
          correctPairs: {} 
        };
        break;
      case 'cloze':
        updatedQuestion.data = { text: '', blanks: [] };
        break;
      case 'essay':
        updatedQuestion.data = {
          responseFormat: 'editor',
          responseRequired: true,
          responseFieldLines: 15,
          minWordLimit: null,
          maxWordLimit: null
        };
        break;
      default:
        break;
    }
    
    setLocalQuestion(updatedQuestion);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-3/4 lg:w-2/3 xl:w-1/2 bg-white dark:bg-gray-800 z-50 shadow-2xl overflow-hidden flex flex-col transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full text-lg font-bold">
              {questionIndex + 1}
            </span>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Kérdés szerkesztése
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {localQuestion.type === 'single_choice' && 'Egy válaszos'}
                {localQuestion.type === 'multiple_choice' && 'Több válaszos'}
                {localQuestion.type === 'true_false' && 'Igaz/Hamis'}
                {localQuestion.type === 'numeric' && 'Számos'}
                {localQuestion.type === 'matching' && 'Illesztéses'}
                {localQuestion.type === 'cloze' && 'Kitöltendő'}
                {localQuestion.type === 'essay' && 'Esszé'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4 max-w-3xl mx-auto">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kérdés szövege *
              </label>
              <textarea
                value={localQuestion.text}
                onChange={(e) => handleLocalUpdate('text', e.target.value)}
                placeholder="Írd ide a kérdést..."
                rows={3}
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
              />
            </div>

            {/* Type and Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kérdés típusa *
                </label>
                <select
                  value={localQuestion.type}
                  onChange={(e) => changeQuestionType(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                >
                  <option value="single_choice">Egy válaszos</option>
                  <option value="multiple_choice">Több válaszos</option>
                  <option value="true_false">Igaz/Hamis</option>
                  <option value="numeric">Számos</option>
                  <option value="matching">Illesztéses</option>
                  <option value="cloze">Kitöltendő</option>
                  <option value="essay">Esszé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pontérték *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={localQuestion.points}
                  onChange={(e) => handleLocalUpdate('points', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kép (opcionális)
              </label>
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition bg-white dark:bg-gray-700">
                  <ImageIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {localQuestion.image ? 'Kép kiválasztva ✓' : 'Kép feltöltése'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleImageUpload(questionIndex, e);
                      // Update local state after upload
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        handleLocalUpdate('image', reader.result);
                      };
                      if (e.target.files[0]) {
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {localQuestion.image && (
                  <button
                    onClick={() => handleLocalUpdate('image', null)}
                    className="px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              {localQuestion.image && (
                <img 
                  src={localQuestion.image} 
                  alt="Preview" 
                  className="mt-3 w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600" 
                />
              )}
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Magyarázat (opcionális)
              </label>
              <textarea
                value={localQuestion.explanation}
                onChange={(e) => handleLocalUpdate('explanation', e.target.value)}
                placeholder="Miért ez a helyes válasz?"
                rows={2}
                className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
              />
            </div>

            {/* Divider */}
            <hr className="border-gray-200 dark:border-gray-700 my-6" />

            {/* Type-Specific Editor */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Válaszlehetőségek
              </h3>

              {localQuestion.type === 'single_choice' && (
                <SingleChoiceEditor
                  question={localQuestion}
                  qIndex={questionIndex}
                  updateQuestionData={(idx, field, value) => handleLocalDataUpdate(field, value)}
                  updateOption={(idx, optIdx, value) => {
                    const newOptions = [...localQuestion.data.options];
                    newOptions[optIdx] = value;
                    handleLocalDataUpdate('options', newOptions);
                  }}
                  addOption={() => {
                    const newOptions = [...localQuestion.data.options, ''];
                    handleLocalDataUpdate('options', newOptions);
                  }}
                  removeOption={() => {
                    if (localQuestion.data.options.length > 2) {
                      const newOptions = [...localQuestion.data.options];
                      newOptions.pop();
                      handleLocalDataUpdate('options', newOptions);
                    }
                  }}
                />
              )}

              {localQuestion.type === 'multiple_choice' && (
                <MultipleChoiceEditor
                  question={localQuestion}
                  qIndex={questionIndex}
                  updateOption={(idx, optIdx, value) => {
                    const newOptions = [...localQuestion.data.options];
                    newOptions[optIdx] = value;
                    handleLocalDataUpdate('options', newOptions);
                  }}
                  addOption={() => {
                    const newOptions = [...localQuestion.data.options, ''];
                    handleLocalDataUpdate('options', newOptions);
                  }}
                  removeOption={() => {
                    if (localQuestion.data.options.length > 2) {
                      const newOptions = [...localQuestion.data.options];
                      newOptions.pop();
                      handleLocalDataUpdate('options', newOptions);
                    }
                  }}
                  toggleMultipleChoice={(idx, optIdx) => {
                    const indices = localQuestion.data.correctIndices || [];
                    const idxPos = indices.indexOf(optIdx);
                    const newIndices = idxPos > -1 
                      ? indices.filter(i => i !== optIdx)
                      : [...indices, optIdx];
                    handleLocalDataUpdate('correctIndices', newIndices);
                  }}
                />
              )}

              {localQuestion.type === 'true_false' && (
                <TrueFalseEditor
                  question={localQuestion}
                  qIndex={questionIndex}
                  updateQuestionData={(idx, field, value) => handleLocalDataUpdate(field, value)}
                />
              )}

              {localQuestion.type === 'numeric' && (
                <NumericEditor
                  question={localQuestion}
                  qIndex={questionIndex}
                  updateQuestionData={(idx, field, value) => handleLocalDataUpdate(field, value)}
                />
              )}

              {localQuestion.type === 'matching' && (
                <MatchingEditor
                  question={localQuestion}
                  qIndex={questionIndex}
                  updateQuestionData={(idx, field, value) => handleLocalDataUpdate(field, value)}
                  addMatchingPair={() => {
                    const newPairs = [...localQuestion.data.pairs, { left: '', right: '' }];
                    handleLocalDataUpdate('pairs', newPairs);
                  }}
                  removeMatchingPair={(idx, pairIdx) => {
                    if (localQuestion.data.pairs.length > 2) {
                      const newPairs = [...localQuestion.data.pairs];
                      newPairs.splice(pairIdx, 1);
                      handleLocalDataUpdate('pairs', newPairs);
                    }
                  }}
                  updateMatchingPair={(idx, pairIdx, side, value) => {
                    const newPairs = [...localQuestion.data.pairs];
                    newPairs[pairIdx][side] = value;
                    handleLocalDataUpdate('pairs', newPairs);
                  }}
                />
              )}

              {localQuestion.type === 'cloze' && (
                <ClozeEditor
                  question={localQuestion}
                  onUpdate={(field, value) => handleLocalUpdate(field, value)}
                  onUpdateData={(field, value) => handleLocalDataUpdate(field, value)}
                />
              )}

              {localQuestion.type === 'essay' && (
                <EssayEditor
                  question={localQuestion}
                  qIndex={questionIndex}
                  updateQuestionData={(idx, field, value) => handleLocalDataUpdate(field, value)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto">
            <Button
              onClick={handleSave}
              variant="primary"
              size="lg"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Mentés
            </Button>
            
            {onDelete && (
              <Button
                onClick={() => {
                  if (window.confirm('Biztosan törölni akarod ezt a kérdést?')) {
                    onDelete();
                    onClose();
                  }
                }}
                variant="danger"
                size="lg"
                className="sm:w-auto"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            
            <Button
              onClick={onClose}
              variant="secondary"
              size="lg"
              className="sm:w-auto"
            >
              Mégse
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionDrawer;