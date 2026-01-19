import React from 'react';
import { Plus, Minus, CheckCircle } from 'lucide-react';

const MultipleChoiceEditor = ({ question, qIndex, updateOption, addOption, removeOption, toggleMultipleChoice }) => {
  return (
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
          <div key={oIndex} className="relative">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={question.data.correctIndices?.includes(oIndex)}
                onChange={() => toggleMultipleChoice(qIndex, oIndex)}
                className="w-5 h-5 text-indigo-600 rounded cursor-pointer flex-shrink-0"
              />
              <span className="font-medium text-gray-700 w-6 flex-shrink-0">
                {String.fromCharCode(65 + oIndex)}.
              </span>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                placeholder={`Válasz ${String.fromCharCode(65 + oIndex)}`}
                className="flex-1 px-3 py-2 pr-10 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {question.data.correctIndices?.includes(oIndex) && (
                <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        💡 Pipáld be az összes helyes választ
      </p>
    </div>
  );
};

export default MultipleChoiceEditor;