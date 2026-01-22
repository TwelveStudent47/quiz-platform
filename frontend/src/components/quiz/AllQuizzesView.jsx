import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Calendar, User, ArrowLeft, Edit } from 'lucide-react';
import Card, { CardBody } from '../common/Card';
import Button from '../common/Button';
import { quizAPI } from '../../services/api';

const AllQuizzesView = ({ onBack, onStartQuiz, onEditQuiz }) => {
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllQuizzes();
  }, []);

  const loadAllQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizAPI.getAll();
      setAllQuizzes(data);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      alert('Hiba történt a tesztek betöltése során');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <Card>
        <CardBody className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={onBack}
              variant="secondary"
              size="sm"
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Vissza
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                Összes Teszt
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {allQuizzes.length} teszt található
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quiz Grid */}
      {allQuizzes.length === 0 ? (
        <Card>
          <CardBody className="p-8 sm:p-12 text-center">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">Nincs elérhető teszt</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {allQuizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                  {/* Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-base sm:text-lg text-gray-800 line-clamp-2">
                        {quiz.title}
                      </h3>
                      {quiz.is_mine && (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full whitespace-nowrap">
                          Saját
                        </span>
                      )}
                    </div>
                    {quiz.topic && (
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                        {quiz.topic}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  {quiz.description && (
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                      {quiz.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span>{quiz.question_count} kérdés</span>
                    </div>
                    {quiz.time_limit && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{quiz.time_limit} perc</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(quiz.created_at)}</span>
                    </div>
                    {!quiz.is_mine && quiz.creator_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{quiz.creator_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  {quiz.attempt_count > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">
                          {quiz.attempt_count} próbálkozás
                        </span>
                        {quiz.average_score !== null && (
                          <span className="font-semibold text-indigo-600">
                            Átlag: {Math.round(quiz.average_score)}%
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action button */}
                  {/* Action buttons */}
                  <div className="space-y-2">
                    {/* Edit button - csak saját teszteknél */}
                    {quiz.is_mine && (
                      <Button
                        onClick={() => onEditQuiz(quiz)}
                        variant="secondary"
                        size="md"
                        className="w-full inline-flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Szerkesztés
                      </Button>
                    )}
                    
                    {/* Start button - mindig látszik */}
                    <Button
                      onClick={() => onStartQuiz(quiz)}
                      variant="primary"
                      size="md"
                      className="w-full"
                    >
                      Teszt Indítása
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllQuizzesView;