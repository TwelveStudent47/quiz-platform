import React from 'react';
import { Edit3, Trash2, Image as ImageIcon, GripVertical } from 'lucide-react';

const QuestionListItem = ({ question, index, onEdit, onDelete, isDragging }) => {
  const getTypeLabel = (type) => {
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

  const getTypeColor = (type) => {
    const colors = {
      'single_choice': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      'multiple_choice': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'true_false': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'numeric': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      'matching': 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
      'cloze': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      'essay': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
    };
    return colors[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const getQuestionPreview = () => {
    if (question.type === 'cloze' && question.data?.text) {
      // Remove placeholders for preview
      return question.data.text.replace(/\{\d+\}/g, '___');
    }
    return question.text || 'Nincs kérdés szöveg';
  };

  return (
    <div 
      className={`group border-2 rounded-lg transition-all ${
        isDragging 
          ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div className="flex-shrink-0 pt-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>

          {/* Question Number Badge */}
          <div className="flex-shrink-0">
            <span className="flex items-center justify-center w-8 h-8 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full text-sm font-bold">
              {index + 1}
            </span>
          </div>

          {/* Question Content */}
          <div className="flex-1 min-w-0">
            {/* Question Text */}
            <p className="text-base font-medium text-gray-800 dark:text-white line-clamp-2 mb-2">
              {getQuestionPreview()}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Badge */}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(question.type)} transition-colors`}>
                {getTypeLabel(question.type)}
              </span>

              {/* Points Badge */}
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 transition-colors">
                {question.points || 1} pont
              </span>

              {/* Has Image Indicator */}
              {question.image && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 transition-colors">
                  <ImageIcon className="w-3 h-3" />
                  Kép
                </span>
              )}

              {/* Has Explanation Indicator */}
              {question.explanation && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 transition-colors">
                  💡 Magyarázat
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
              title="Szerkesztés"
            >
              <Edit3 className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {
                if (window.confirm('Biztosan törölni akarod ezt a kérdést?')) {
                  onDelete();
                }
              }}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
              title="Törlés"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionListItem;