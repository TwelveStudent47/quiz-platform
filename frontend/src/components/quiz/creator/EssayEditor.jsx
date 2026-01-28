import React from 'react';

const EssayEditor = ({ question, qIndex, updateQuestionData }) => {
  return (
    <div className="space-y-4">
      {/* Response Format */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
          Válasz formátum
        </label>
        <select
          value={question.data.responseFormat || 'editor'}
          onChange={(e) => updateQuestionData(qIndex, 'responseFormat', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
        >
          <option value="editor">Szerkesztő (formázott szöveg)</option>
          <option value="plain">Egyszerű szöveg</option>
          <option value="html">HTML</option>
        </select>
      </div>

      {/* Response Required */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`responseRequired-${qIndex}`}
          checked={question.data.responseRequired !== false}
          onChange={(e) => updateQuestionData(qIndex, 'responseRequired', e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor={`responseRequired-${qIndex}`} className="text-sm text-gray-700 dark:text-gray-300 transition-colors">
          Válasz kötelező
        </label>
      </div>

      {/* Response Field Lines */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
          Textarea sorok száma
        </label>
        <input
          type="number"
          min="3"
          max="50"
          value={question.data.responseFieldLines || 15}
          onChange={(e) => updateQuestionData(qIndex, 'responseFieldLines', parseInt(e.target.value) || 15)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
        />
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 transition-colors">
          A válasz mező magassága (3-50 sor)
        </p>
      </div>

      {/* Word Limits */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 transition-colors">
        <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-3 transition-colors">
          📝 Szó limitek (opcionális)
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              Minimum szavak
            </label>
            <input
              type="number"
              min="0"
              placeholder="0 = nincs limit"
              value={question.data.minWordLimit || ''}
              onChange={(e) => updateQuestionData(qIndex, 'minWordLimit', parseInt(e.target.value) || null)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
              Maximum szavak
            </label>
            <input
              type="number"
              min="0"
              placeholder="0 = nincs limit"
              value={question.data.maxWordLimit || ''}
              onChange={(e) => updateQuestionData(qIndex, 'maxWordLimit', parseInt(e.target.value) || null)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 transition-colors">
          0 vagy üres = nincs limit. Ezek figyelmeztető jelzések, nem blokkolnak.
        </p>
      </div>

      {/* Preview */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
          👁️ Előnézet:
        </p>
        <textarea
          placeholder="A diák itt írja majd a válaszát..."
          rows={Math.min(question.data.responseFieldLines || 15, 8)}
          disabled
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 resize-none opacity-60 transition-colors"
        />
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 transition-colors">
          ℹ️ Ez egy esszé kérdés. A válasz manuális értékelést igényel.
        </p>
      </div>
    </div>
  );
};

export default EssayEditor;