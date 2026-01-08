import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const TrueFalseEditor = ({ question, qIndex, updateQuestionData }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Helyes válasz *
      </label>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => updateQuestionData(qIndex, 'correctAnswer', true)}
          className={`flex-1 px-6 py-4 rounded-lg border-2 transition ${
            question.data.correctAnswer === true
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold text-lg">IGAZ</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => updateQuestionData(qIndex, 'correctAnswer', false)}
          className={`flex-1 px-6 py-4 rounded-lg border-2 transition ${
            question.data.correctAnswer === false
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <XCircle className="w-6 h-6" />
            <span className="font-semibold text-lg">HAMIS</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default TrueFalseEditor;
