import React from 'react';
import { Trash2, Edit } from 'lucide-react';

const QuizCard = ({ quiz, onStart, onDelete, onEdit }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Biztosan törlöd ezt a tesztet? Ez véglegesen törli az összes hozzá tartozó eredményt is!')) {
      onDelete(quiz.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(quiz);
  };

  return (
    <div
      onClick={() => onStart(quiz)}
      className="relative border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition cursor-pointer group"
    >
      <h3 className="font-semibold text-gray-800 pr-20">{quiz.title}</h3>
      <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
        <span>{quiz.question_count} kérdés</span>
        {quiz.topic && (
          <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
            {quiz.topic}
          </span>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={handleEdit}
          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
          title="Teszt szerkesztése"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Teszt törlése"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default QuizCard;
