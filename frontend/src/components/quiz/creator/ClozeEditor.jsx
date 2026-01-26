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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kérdés szövege (használj {'{0}'}, {'{1}'}, stb. az üres helyek jelölésére) *
        </label>
        <textarea
          value={question.data.text || ''}
          onChange={(e) => onUpdateData('text', e.target.value)}
          placeholder="pl. A Föld legnagyobb bolygója a {0}, és {1} hold van körülötte."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows={3}
        />
        <p className="mt-1 text-xs text-gray-500">
          Példa: "A {'{0}'} a legnagyobb bolygó, és {'{1}'} hold van."
        </p>
      </div>

      {/* Blanks Configuration */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
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
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-700">
                    {'{' + blankIdx + '}'} - {blank.type === 'dropdown' ? 'Dropdown' : 'Szöveges bevitel'}
                  </span>
                </div>
                <button
                  onClick={() => removeBlank(blankIdx)}
                  className="text-red-600 hover:text-red-700"
                  title="Törlés"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {blank.type === 'dropdown' ? (
                // Dropdown Blank
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                      {blank.options.length > 2 && (
                        <button
                          onClick={() => removeOption(blankIdx, optIdx)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {blank.correctIndex === optIdx && (
                        <span className="text-xs text-green-600 font-medium">Helyes</span>
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
                    <label className="text-xs font-medium text-gray-600">
                      Helyes válasz:
                    </label>
                    <input
                      type="text"
                      value={blank.correctAnswer || ''}
                      onChange={(e) => updateBlank(blankIdx, 'correctAnswer', e.target.value)}
                      placeholder="pl. Jupiter"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
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
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm">Még nincsenek üres helyek definiálva.</p>
            <p className="text-xs mt-1">Kattints a "Dropdown" vagy "Szöveges" gombra az első üres hely hozzáadásához.</p>
          </div>
        )}
      </div>

      {/* Preview */}
      {question.data.text && question.data.blanks && question.data.blanks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs font-medium text-blue-800 mb-2">Előnézet:</p>
          <p className="text-sm text-gray-700">
            {question.data.text.split(/(\{\d+\})/g).map((part, idx) => {
              const match = part.match(/\{(\d+)\}/);
              if (match) {
                const blankIdx = parseInt(match[1]);
                const blank = question.data.blanks[blankIdx];
                if (blank) {
                  return (
                    <span key={idx} className="inline-block mx-1">
                      {blank.type === 'dropdown' ? (
                        <select className="px-2 py-1 border border-blue-300 rounded text-xs bg-white">
                          <option>Válassz...</option>
                          {blank.options.map((opt, i) => (
                            <option key={i}>{opt || `Válasz ${i + 1}`}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder="..."
                          className="w-20 px-2 py-1 border border-blue-300 rounded text-xs"
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