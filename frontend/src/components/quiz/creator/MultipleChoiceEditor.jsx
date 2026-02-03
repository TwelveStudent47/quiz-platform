import React, { useState } from 'react';
import { Plus, Minus, CheckCircle, Clipboard } from 'lucide-react';
import PasteAnswersModal from './PasteAnswersModal';

const MultipleChoiceEditor = ({ question, qIndex, updateOption, addOption, removeOption, toggleMultipleChoice, pasteFromClipboard }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplyOptions = (options) => {
    pasteFromClipboard(options);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
          Válaszlehetőségek * ({question.data.correctIndices?.length || 0} helyes)
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
                type="checkbox"
                checked={question.data.correctIndices?.includes(oIndex)}
                onChange={() => toggleMultipleChoice(qIndex, oIndex)}
                className="w-5 h-5 text-indigo-600 rounded cursor-pointer flex-shrink-0"
              />
              <span className="font-medium text-gray-700 dark:text-gray-300 w-6 flex-shrink-0 transition-colors">
                {String.fromCharCode(65 + oIndex)}.
              </span>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                placeholder={`Válasz ${String.fromCharCode(65 + oIndex)}`}
                className="flex-1 px-3 py-2 pr-10 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
              />
              {question.data.correctIndices?.includes(oIndex) && (
                <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 transition-colors" />
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 transition-colors">
        💡 Pipáld be az összes helyes választ
      </p>

      <PasteAnswersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleApplyOptions}
      />
    </div>
  );
};

export default MultipleChoiceEditor;