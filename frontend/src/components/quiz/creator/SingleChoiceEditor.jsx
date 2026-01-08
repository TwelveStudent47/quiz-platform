import React from 'react';
import { Plus, Minus } from 'lucide-react';

const SingleChoiceEditor = ({ question, qIndex, updateQuestionData, updateOption, addOption, removeOption }) => {
  return (
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
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
              placeholder={`Válasz ${oIndex + 1}`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {question.data.correctIndex === oIndex && (
              <span className="text-xs text-green-600 font-medium whitespace-nowrap">✓ Helyes</span>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        💡 Jelöld be a helyes választ a rádiógombbal
      </p>
    </div>
  );
};

export default SingleChoiceEditor;
