import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, ArrowLeft, Trophy, Target, Clock, Calendar } from 'lucide-react';
import Card, { CardBody } from '../common/Card';
import Button from '../common/Button';
import { historyAPI } from '../../services/api';

const AllResultsView = ({ onBack, onReviewAttempt }) => {
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    bestScore: 0,
    totalTime: 0
  });

  useEffect(() => {
    loadAllResults();
  }, []);

  const loadAllResults = async () => {
    try {
      setLoading(true);
      const data = await historyAPI.getAll();
      setAllResults(data);
      calculateStats(data);
    } catch (err) {
      console.error('Failed to load results:', err);
      alert('Hiba történt az eredmények betöltése során');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (results) => {
    if (results.length === 0) {
      setStats({ total: 0, avgScore: 0, bestScore: 0, totalTime: 0 });
      return;
    }

    const total = results.length;
    
    const percentages = results.map(r => parseFloat(r.percentage) || 0);
    const avgScore = percentages.reduce((sum, p) => sum + p, 0) / total;
    const bestScore = Math.max(...percentages);

    const totalTimeSeconds = results.reduce((sum, r) => sum + (parseInt(r.time_spent) || 0), 0);
    const totalTimeMinutes = Math.round(totalTimeSeconds / 60);

    setStats({
      total,
      avgScore: Math.round(avgScore),
      bestScore: Math.round(bestScore),
      totalTime: totalTimeMinutes
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const secs = parseInt(seconds);
    if (isNaN(secs)) return 'N/A';
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage) => {
    const pct = parseFloat(percentage) || 0;
    if (pct >= 90) return 'text-green-600 bg-green-50';
    if (pct >= 70) return 'text-blue-600 bg-blue-50';
    if (pct >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadge = (percentage) => {
    const pct = parseFloat(percentage) || 0;
    if (pct >= 90) return '🏆 Kiváló';
    if (pct >= 70) return '⭐ Jó';
    if (pct >= 50) return '👍 Átlagos';
    return '📚 Gyakorolj még';
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
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
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
                Összes Eredmény
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {allResults.length} próbálkozás összesen
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          {allResults.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-indigo-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs sm:text-sm text-indigo-600 font-medium">
                    Legjobb
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                  {stats.bestScore}%
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="text-xs sm:text-sm text-green-600 font-medium">
                    Átlag
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {stats.avgScore}%
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-xs sm:text-sm text-blue-600 font-medium">
                    Tesztek
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">
                  {stats.total}
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-xs sm:text-sm text-purple-600 font-medium">
                    Össz idő
                  </span>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">
                  {stats.totalTime}p
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Results List */}
      {allResults.length === 0 ? (
        <Card>
          <CardBody className="p-8 sm:p-12 text-center">
            <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">Még nincs kitöltött teszt</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {allResults.map((attempt) => {
            const pct = parseFloat(attempt.percentage) || 0;
            return (
              <Card key={attempt.id} className="hover:shadow-lg transition-shadow">
                <CardBody className="p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-gray-800 line-clamp-2">
                          {attempt.quiz_title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-gray-500">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{formatDate(attempt.completed_at)}</span>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className={`px-3 py-2 rounded-lg text-center ${getScoreColor(attempt.percentage)}`}>
                        <div className="text-xl sm:text-2xl font-bold">
                          {Math.round(pct)}%
                        </div>
                        <div className="text-xs font-medium whitespace-nowrap">
                          {attempt.score}/{attempt.total_points}
                        </div>
                      </div>
                    </div>

                    {/* Performance Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs sm:text-sm font-medium text-gray-700">
                      {getScoreBadge(attempt.percentage)}
                    </div>

                    {/* Details */}
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                      {attempt.time_spent && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{formatTime(attempt.time_spent)}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={() => onReviewAttempt(attempt)}
                      variant="primary"
                      size="sm"
                      className="w-full inline-flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Visszanézés
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllResultsView;