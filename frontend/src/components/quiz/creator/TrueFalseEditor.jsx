import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const TrueFalseEditor = ({ question, qIndex, updateQuestionData }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Helyes válasz *
      </label>
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => updateQuestionData(qIndex, 'correctAnswer', true)}
          className={`px-3 py-3 sm:px-6 sm:py-4 rounded-lg border-2 transition ${
            question.data.correctAnswer === true
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-semibold text-sm sm:text-lg">IGAZ</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => updateQuestionData(qIndex, 'correctAnswer', false)}
          className={`px-3 py-3 sm:px-6 sm:py-4 rounded-lg border-2 transition ${
            question.data.correctAnswer === false
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-semibold text-sm sm:text-lg">HAMIS</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default TrueFalseEditor;