import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const MatchingEditor = ({ question, qIndex, updateMatchingPair, addMatchingPair, removeMatchingPair }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
          Párosítandó elemek ({question.data.pairs?.length || 0} pár)
        </label>
        <button
          type="button"
          onClick={() => addMatchingPair(qIndex)}
          className="flex items-center gap-1 px-3 py-1 text-xs sm:text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 w-full sm:w-auto justify-center transition-colors"
        >
          <Plus className="w-4 h-4" />
          Pár hozzáadása
        </button>
      </div>
      <div className="space-y-3">
        {(question.data.pairs || []).map((pair, pairIndex) => (
          <div key={pairIndex} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
            {/* Pair header with number and delete button */}
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400 text-sm transition-colors">
                {pairIndex + 1}. pár
              </span>
              {(question.data.pairs?.length || 0) > 2 && (
                <button
                  type="button"
                  onClick={() => removeMatchingPair(qIndex, pairIndex)}
                  className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Inputs - Vertical on mobile, horizontal on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-2 lg:gap-3 items-center">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 lg:hidden transition-colors">
                  Bal oldal
                </label>
                <input
                  type="text"
                  value={pair.left}
                  onChange={(e) => updateMatchingPair(qIndex, pairIndex, 'left', e.target.value)}
                  placeholder="Bal oldal"
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
                />
              </div>
              
              <span className="text-gray-400 dark:text-gray-500 text-center text-xl hidden lg:block">↔</span>
              
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1 lg:hidden transition-colors">
                  Jobb oldal
                </label>
                <input
                  type="text"
                  value={pair.right}
                  onChange={(e) => updateMatchingPair(qIndex, pairIndex, 'right', e.target.value)}
                  placeholder="Jobb oldal"
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 transition-colors">
        💡 A felhasználónak össze kell kötnie a bal és jobb oldali elemeket
      </p>
    </div>
  );
};

export default MatchingEditor;