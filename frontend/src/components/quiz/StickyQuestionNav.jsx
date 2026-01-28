import React, { useState } from 'react';
import { Plus, ChevronUp, List } from 'lucide-react';

const StickyQuestionNav = ({ questions, onAddQuestion, onJumpToQuestion }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleJump = (index) => {
    onJumpToQuestion(index);
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
      {/* Expanded Navigation List */}
      {isExpanded && questions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto mb-2 animate-slide-up">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Ugrás kérdésre ({questions.length})
            </p>
          </div>
          <div className="max-w-xs">
            {questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleJump(idx)}
                className="w-full px-4 py-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                    {q.text || q.data?.text?.substring(0, 40) || 'Nincs kérdés szöveg'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
        {/* Jump to Question Button */}
        {questions.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full shadow-lg hover:shadow-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
            title="Ugrás kérdésre"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <List className="w-5 h-5" />
            )}
            <span className="hidden sm:inline text-sm font-medium">
              Kérdések
            </span>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold">
              {questions.length}
            </span>
          </button>
        )}

        {/* Add New Question Button */}
        <button
          onClick={onAddQuestion}
          className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          title="Új kérdés hozzáadása"
        >
          <Plus className="w-6 h-6" />
          <span className="hidden sm:inline font-semibold">
            Új kérdés
          </span>
        </button>
      </div>

      {/* Tooltip for mobile */}
      <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 text-right px-2">
        Új kérdés / Navigáció
      </div>
    </div>
  );
};

export default StickyQuestionNav;