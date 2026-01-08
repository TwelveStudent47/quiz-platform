import React from 'react';

const NumericEditor = ({ question, qIndex, updateQuestionData }) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Helyes válasz (szám) *
        </label>
        <input
          type="number"
          step="any"
          value={question.data.correctAnswer || 0}
          onChange={(e) => updateQuestionData(qIndex, 'correctAnswer', parseFloat(e.target.value) || 0)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="pl. 42"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mértékegység (opcionális)
        </label>
        <input
          type="text"
          value={question.data.unit || ''}
          onChange={(e) => updateQuestionData(qIndex, 'unit', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="pl. km, kg, °C"
        />
      </div>
      <p className="text-xs text-gray-500">
        💡 A felhasználónak számot kell beírnia válaszként
      </p>
    </div>
  );
};

export default NumericEditor;
