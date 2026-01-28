import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import Button from '../../common/Button';

const ClozeEditor = ({ question, onUpdate, onUpdateData }) => {
  const addBlank = (type = 'dropdown') => {
    const blanks = question.data.blanks || [];
    const newBlank = type === 'dropdown'
      ? { type: 'dropdown', options: ['', '', ''], correctIndex: 0 }
      : { type: 'text', correctAnswer: '', caseSensitive: false };
    
    onUpdateData('blanks', [...blanks, newBlank]);
  };

  const removeBlank = (index) => {
    const blanks = [...question.data.blanks];
    blanks.splice(index, 1);
    onUpdateData('blanks', blanks);
  };

  const updateBlank = (index, field, value) => {
    const blanks = [...question.data.blanks];
    blanks[index][field] = value;
    onUpdateData('blanks', blanks);
  };

  const updateOption = (blankIndex, optionIndex, value) => {
    const blanks = [...question.data.blanks];
    blanks[blankIndex].options[optionIndex] = value;
    onUpdateData('blanks', blanks);
  };

  const addOption = (blankIndex) => {
    const blanks = [...question.data.blanks];
    blanks[blankIndex].options.push('');
    onUpdateData('blanks', blanks);
  };

  const removeOption = (blankIndex, optionIndex) => {
    const blanks = [...question.data.blanks];
    if (blanks[blankIndex].options.length > 2) {
      blanks[blankIndex].options.splice(optionIndex, 1);
      if (blanks[blankIndex].correctIndex >= blanks[blankIndex].options.length) {
        blanks[blankIndex].correctIndex = blanks[blankIndex].options.length - 1;
      }
      onUpdateData('blanks', blanks);
    }
  };

  return (
    <div className="space-y-4">
      {/* Question Text with Blanks */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors">
          Kérdés szövege (használj {'{0}'}, {'{1}'}, stb. az üres helyek jelölésére) *
        </label>
        <textarea
          value={question.data.text || ''}
          onChange={(e) => onUpdateData('text', e.target.value)}
          placeholder="pl. A Föld legnagyobb bolygója a {0}, és {1} hold van körülötte."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
          rows={3}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500 transition-colors">
          Példa: "A {'{0}'} a legnagyobb bolygó, és {'{1}'} hold van."
        </p>
      </div>

      {/* Blanks Configuration */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
            Üres helyek ({question.data.blanks?.length || 0})
          </label>
          <div className="flex gap-2">
            <Button
              onClick={() => addBlank('dropdown')}
              variant="secondary"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Dropdown
            </Button>
            <Button
              onClick={() => addBlank('text')}
              variant="secondary"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Szöveges
            </Button>
          </div>
        </div>

        {/* Blank Items */}
        <div className="space-y-4">
          {(question.data.blanks || []).map((blank, blankIdx) => (
            <div
              key={blankIdx}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors">
                    {'{' + blankIdx + '}'} - {blank.type === 'dropdown' ? 'Dropdown' : 'Szöveges bevitel'}
                  </span>
                </div>
                <button
                  onClick={() => removeBlank(blankIdx)}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  title="Törlés"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {blank.type === 'dropdown' ? (
                // Dropdown Blank
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors">
                    Választási lehetőségek:
                  </label>
                  {(blank.options || []).map((option, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={blank.correctIndex === optIdx}
                        onChange={() => updateBlank(blankIdx, 'correctIndex', optIdx)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(blankIdx, optIdx, e.target.value)}
                        placeholder={`Válasz ${optIdx + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
                      />
                      {blank.options.length > 2 && (
                        <button
                          onClick={() => removeOption(blankIdx, optIdx)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {blank.correctIndex === optIdx && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium transition-colors">
                          Helyes
                        </span>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={() => addOption(blankIdx)}
                    variant="secondary"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Új választási lehetőség
                  </Button>
                </div>
              ) : (
                // Text Input Blank
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors">
                      Helyes válasz:
                    </label>
                    <input
                      type="text"
                      value={blank.correctAnswer || ''}
                      onChange={(e) => updateBlank(blankIdx, 'correctAnswer', e.target.value)}
                      placeholder="pl. Jupiter"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 transition-colors"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={blank.caseSensitive || false}
                      onChange={(e) => updateBlank(blankIdx, 'caseSensitive', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    Kis/nagybetű érzékeny
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>

        {(!question.data.blanks || question.data.blanks.length === 0) && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors">
            <p className="text-sm">Még nincsenek üres helyek definiálva.</p>
            <p className="text-xs mt-1">Kattints a "Dropdown" vagy "Szöveges" gombra az első üres hely hozzáadásához.</p>
          </div>
        )}
      </div>

      {/* Preview */}
      {question.data.text && question.data.blanks && question.data.blanks.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 transition-colors">
          <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-2 transition-colors">
            Előnézet:
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors">
            {question.data.text.split(/(\{\d+\})/g).map((part, idx) => {
              const match = part.match(/\{(\d+)\}/);
              if (match) {
                const blankIdx = parseInt(match[1]);
                const blank = question.data.blanks[blankIdx];
                if (blank) {
                  return (
                    <span key={idx} className="inline-block mx-1">
                      {blank.type === 'dropdown' ? (
                        <select className="px-2 py-1 border border-blue-300 dark:border-blue-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          <option>Válassz...</option>
                          {blank.options.map((opt, i) => (
                            <option key={i}>{opt || `Válasz ${i + 1}`}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="..."
                          className="w-20 px-2 py-1 border border-blue-300 dark:border-blue-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          readOnly
                        />
                      )}
                    </span>
                  );
                }
              }
              return <span key={idx}>{part}</span>;
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClozeEditor;