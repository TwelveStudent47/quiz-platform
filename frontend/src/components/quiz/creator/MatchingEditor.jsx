import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

const MatchingEditor = ({ question, qIndex, updateMatchingPair, addMatchingPair, removeMatchingPair }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          Párosítandó elemek ({question.data.pairs?.length || 0} pár)
        </label>
        <button
          type="button"
          onClick={() => addMatchingPair(qIndex)}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
        >
          <Plus className="w-4 h-4" />
          Pár hozzáadása
        </button>
      </div>
      <div className="space-y-3">
        {(question.data.pairs || []).map((pair, pairIndex) => (
          <div key={pairIndex} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-600">{pairIndex + 1}.</span>
            <input
              type="text"
              value={pair.left}
              onChange={(e) => updateMatchingPair(qIndex, pairIndex, 'left', e.target.value)}
              placeholder="Bal oldal"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <span className="text-gray-400">↔</span>
            <input
              type="text"
              value={pair.right}
              onChange={(e) => updateMatchingPair(qIndex, pairIndex, 'right', e.target.value)}
              placeholder="Jobb oldal"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {(question.data.pairs?.length || 0) > 2 && (
              <button
                type="button"
                onClick={() => removeMatchingPair(qIndex, pairIndex)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        💡 A felhasználónak össze kell kötnie a bal és jobb oldali elemeket
      </p>
    </div>
  );
};

export default MatchingEditor;
