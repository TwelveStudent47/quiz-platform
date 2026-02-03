import React, { useState } from 'react';
import { Plus, Minus, Clipboard } from 'lucide-react';
import PasteAnswersModal from './PasteAnswersModal';

const SingleChoiceEditor = ({ question, qIndex, updateQuestionData, updateOption, addOption, removeOption, pasteFromClipboard }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplyOptions = (options) => {
    pasteFromClipboard(options);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
          Válaszlehetőségek * ({question.data.options?.length || 0})
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            type="button"
            title="Beillesztés vágólapról (soronként vagy ;-vel elválasztva)"
          >
            <Clipboard className="w-4 h-4" />
          </button>
          <button
            onClick={() => removeOption(qIndex)}
            disabled={(question.data.options?.length || 0) <= 2}
            className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 transition-colors"
            type="button"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => addOption(qIndex)}
            disabled={(question.data.options?.length || 0) >= 6}
            className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50 transition-colors"
            type="button"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {(question.data.options || []).map((option, oIndex) => (
          <div key={oIndex} className="relative">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${qIndex}`}
                checked={question.data.correctIndex === oIndex}
                onChange={() => updateQuestionData(qIndex, 'correctIndex', oIndex)}
                className="w-5 h-5 text-indigo-600 cursor-pointer flex-shrink-0"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                placeholder={`Válasz ${oIndex + 1}`}
                className="flex-1 px-3 py-2 pr-16 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
              />
              {question.data.correctIndex === oIndex && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600 dark:text-green-400 font-medium whitespace-nowrap bg-white dark:bg-gray-700 px-1 transition-colors">
                  ✓ Helyes
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 transition-colors">
        💡 Jelöld be a helyes választ a rádiógombbal
      </p>

      <PasteAnswersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleApplyOptions}
      />
    </div>
  );
};

export default SingleChoiceEditor;